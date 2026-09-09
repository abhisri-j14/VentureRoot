"""
GramBiz Model 2 -- FastAPI Application Server
===============================================
Exposes REST endpoints for hyper-local market viability, competition analysis,
and category opportunity ranking. Listens on Port 8002 by default.
"""

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api.dependencies import get_inference_engine
from api.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    CategoryListResponse,
    HealthResponse,
)
from src.config import API_PORT, CANONICAL_CATEGORIES, METHODOLOGY_VERSION, MODEL_VERSION
from src.models.predict import Model2InferenceEngine

app = FastAPI(
    title="GramBiz Model 2 -- Business Viability & Opportunity Engine API",
    description="Hyper-Local Business Viability, Competition & Category Ranking Engine for Rural India",
    version=MODEL_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthResponse)
def root_endpoint():
    """Service health check endpoint."""
    return HealthResponse(
        status="ONLINE",
        service="GramBiz Model 2 -- Business Viability & Opportunity Analysis Engine",
        model_version=MODEL_VERSION,
        methodology_version=METHODOLOGY_VERSION,
    )


@app.get("/health", response_model=HealthResponse)
def health_endpoint():
    """Health check endpoint."""
    return root_endpoint()


@app.get("/api/v1/categories", response_model=CategoryListResponse)
def get_supported_categories():
    """List 15 canonical business categories supported by GramBiz."""
    return CategoryListResponse(
        total_categories=len(CANONICAL_CATEGORIES),
        categories=CANONICAL_CATEGORIES,
    )


@app.post("/api/v1/analyze", response_model=AnalysisResponse)
def analyze_location_viability(
    req: AnalysisRequest,
    engine: Model2InferenceEngine = Depends(get_inference_engine),
):
    """
    Perform hyper-local viability analysis and category ranking for a specified location.
    """
    try:
        res = engine.analyze_location(
            state_name=req.state_name,
            district_name=req.district_name,
            subdistrict_name=req.subdistrict_name,
            business_category=req.business_category,
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=API_PORT, reload=False)
