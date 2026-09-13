"""
FastAPI Microservice for GramBiz RAG Knowledge System.

Endpoints:
  GET  /health                   — Health check
  GET  /api/v1/health            — Health check (versioned)
  POST /api/v1/query             — Hybrid retrieval query
  POST /api/v1/ingest            — Trigger document ingestion
  GET  /api/v1/documents         — List document version registry
  POST /api/v1/evaluate          — Run RAG evaluation
  POST /api/v1/verify            — [NEW] Agentic ML prediction verification
  GET  /api/v1/verify/health     — [NEW] Verification system health check
"""

import sys
from pathlib import Path
from typing import Dict, Any, Optional, List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure RAG directory is on import path
RAG_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAG_DIR))

from src.pipeline import RAGPipeline
from src.evaluation.evaluator import RAGEvaluator
from src.config import settings
from src.verification import run_verification, get_retriever

app = FastAPI(
    title="GramBiz RAG Knowledge & Verification Service",
    description=(
        "Authoritative Government Scheme & Regulatory Information Retrieval Engine "
        "with Gemini-powered agentic ML prediction verification."
    ),
    version="2.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten to your Vercel domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Shared instances ────────────────────────────────────────────────────────
pipeline = RAGPipeline()


# ══════════════════════════════════════════════════════════════════════════════
# REQUEST / RESPONSE SCHEMAS
# ══════════════════════════════════════════════════════════════════════════════

class QueryRequest(BaseModel):
    query: str = Field(..., example="What is the maximum project cost under PMEGP for manufacturing?")
    top_k: Optional[int] = Field(default=5, ge=1, le=20)
    filters: Optional[Dict[str, Any]] = None


class QueryResponse(BaseModel):
    query: str
    answer: str
    should_abstain: bool
    confidence_level: str
    citations: List[Dict[str, Any]]
    chunks: List[Dict[str, Any]]
    freshness: str
    latency_ms: float


class VerificationRequest(BaseModel):
    """
    Payload for ML prediction verification via RAG + Gemini agent.
    """
    business_context: Dict[str, Any] = Field(
        ...,
        example={
            "businessName": "Priya Dairy Farm",
            "category": "Dairy & Food Processing",
            "location": "Purba Bardhaman, West Bengal",
            "investment": 500000,
            "margin": 50000,
        },
        description="Core business details for compliance verification.",
    )
    ml_predictions: Dict[str, Any] = Field(
        ...,
        example={
            "market_potential_score": 78.5,
            "opportunity_level": "HIGH",
            "recommended_scheme": "PMEGP",
            "estimated_subsidy": 125000,
            "loan_amount": 450000,
            "break_even_months": 8,
        },
        description="ML model output predictions to be verified against regulations.",
    )
    top_k: Optional[int] = Field(
        default=5,
        ge=2,
        le=10,
        description="Number of regulation chunks to retrieve for context.",
    )
    topic_filter: Optional[str] = Field(
        default=None,
        description="Optional regulation topic keyword to filter retrieval (e.g. 'PMEGP', 'FINANCIAL').",
    )
    report_id: Optional[str] = Field(
        default=None,
        description="Optional Next.js Report ID for correlation.",
    )


class CitationSchema(BaseModel):
    rank: int
    relevance_score: float
    relevance_percent: float
    document: str
    section: str
    excerpt: str
    source_type: str


class VerificationResponse(BaseModel):
    verdict: str                  # "VERIFIED" | "FLAG_WARNING" | "REJECTED"
    compliance_score: int         # 0-100
    verification_report: str      # Full structured markdown from Gemini
    citations: List[CitationSchema]
    retrieved_chunks_count: int
    model_used: str
    report_id: Optional[str]


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    """Service health check."""
    try:
        chunks_count = len(getattr(pipeline.vector_store, "chunks", []))
    except Exception:
        chunks_count = -1
    return {
        "status": "HEALTHY",
        "service": "GramBiz RAG Knowledge & Verification Service",
        "version": "2.0.0",
        "chunks_indexed": chunks_count,
        "rag_mode": settings.rag_mode,
    }


@app.get("/api/v1/verify/health")
def verification_health():
    """Verification subsystem health — loads retriever and reports collection stats."""
    try:
        retriever = get_retriever()
        count = retriever.collection.count()
        return {
            "status": "HEALTHY",
            "collection": "business_regulations",
            "chunks_count": count,
            "embedding_model": "BAAI/bge-large-en-v1.5",
            "gemini_model": "gemini-2.5-flash",
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Verification system unavailable: {e}")


# ══════════════════════════════════════════════════════════════════════════════
# RAG QUERY ENDPOINTS (existing)
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/v1/query", response_model=QueryResponse)
def query_rag(req: QueryRequest):
    """Execute hybrid retrieval query against authoritative RAG index."""
    try:
        res = pipeline.query(req.query, top_k=req.top_k, filters=req.filters)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ingest")
def trigger_ingestion():
    """Trigger ingestion of documents in documents/ folder."""
    try:
        report = pipeline.ingest_documents_from_directory()
        return {"status": "SUCCESS", "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/documents")
def list_documents():
    """List document version registry."""
    return {"registry": pipeline.loader.tracker.registry}


@app.post("/api/v1/evaluate")
def trigger_evaluation():
    """Trigger quantitative evaluation of RAG system."""
    try:
        evaluator = RAGEvaluator(pipeline)
        res = evaluator.run_evaluation()
        return {"status": "SUCCESS", "metrics": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# VERIFICATION ENDPOINT (new)
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/v1/verify", response_model=VerificationResponse)
def verify_ml_prediction(req: VerificationRequest):
    """
    Agentic RAG + Gemini verification of ML model predictions.

    1. Embeds business context with BAAI/bge-large-en-v1.5.
    2. Retrieves top-K regulation chunks from ChromaDB.
    3. Sends retrieved regulations + ML predictions to Gemini agent.
    4. Returns structured verdict, compliance score, full report, and citations.
    """
    try:
        result = run_verification(
            business_context=req.business_context,
            ml_predictions=req.ml_predictions,
            top_k=req.top_k,
            topic_filter=req.topic_filter,
        )

        return VerificationResponse(
            **result,
            report_id=req.report_id,
        )

    except RuntimeError as e:
        # Gemini API key missing or all models failed
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


# ══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.rag_api_host, port=settings.rag_api_port)
