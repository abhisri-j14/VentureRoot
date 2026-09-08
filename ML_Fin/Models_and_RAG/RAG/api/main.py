"""
FastAPI Microservice for GramBiz RAG Knowledge System.
Exposes /health, /api/v1/health, /api/v1/query, /api/v1/ingest, /api/v1/documents, and /api/v1/evaluate endpoints.
Runs on Port 8004.
"""

import sys
from pathlib import Path
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

# Ensure RAG directory is on import path
RAG_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAG_DIR))

from src.pipeline import RAGPipeline
from src.evaluation.evaluator import RAGEvaluator
from src.config import settings

app = FastAPI(
    title="GramBiz RAG Knowledge Service",
    description="Authoritative Government Scheme & Regulatory Information Retrieval Engine",
    version="1.0.0"
)

pipeline = RAGPipeline()

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

@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    """Health check endpoint exposing service status and version."""
    return {
        "status": "HEALTHY",
        "service": "GramBiz RAG Knowledge System",
        "version": "1.0.0",
        "methodology_version": "1.0.0-Hybrid-Authority-v1",
        "chunks_indexed": len(pipeline.vector_store.chunks),
        "rag_mode": settings.rag_mode
    }

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.rag_api_host, port=settings.rag_api_port)
