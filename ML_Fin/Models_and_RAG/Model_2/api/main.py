"""
GramBiz Model 2 -- FastAPI Application Server
===============================================
Exposes REST endpoints for hyper-local market viability, competition analysis,
and category opportunity ranking. Listens on Port 8002 by default.
Supports querying authoritative business records from the Next.js backend.
"""

import os
import sys
from pathlib import Path
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Ensure ML_Fin root and Model_2 are in path
CURRENT_DIR = Path(__file__).resolve().parent
MODEL2_ROOT = CURRENT_DIR.parent
ML_FIN_ROOT = MODEL2_ROOT.parent.parent
if str(MODEL2_ROOT) not in sys.path:
    sys.path.insert(0, str(MODEL2_ROOT))
if str(ML_FIN_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_FIN_ROOT))

from api.dependencies import get_inference_engine
from api.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    CategoryListResponse,
    HealthResponse,
)
from src.config import API_PORT, CANONICAL_CATEGORIES, METHODOLOGY_VERSION, MODEL_VERSION
from src.models.predict import Model2InferenceEngine
from common.backend_client import fetch_business_by_id

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
    Perform hyper-local viability analysis and category ranking for a specified location
    or directly for a backend business by business_id.
    """
    try:
        state_name = req.get_state()
        district_name = req.get_district()
        subdistrict_name = req.get_subdistrict()
        business_category = req.get_category()

        # If business_id is supplied, query the backend business service
        if req.business_id:
            biz = fetch_business_by_id(req.business_id)
            if biz:
                state_name = biz.get("state") or state_name
                district_name = biz.get("district") or district_name
                subdistrict_name = biz.get("subdistrict") or subdistrict_name
                business_category = biz.get("category_name") or business_category

        res = engine.analyze_location(
            state_name=state_name,
            district_name=district_name,
            subdistrict_name=subdistrict_name,
            business_category=business_category,
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/analyze/{business_id}", response_model=AnalysisResponse)
def analyze_by_business_id(
    business_id: str,
    engine: Model2InferenceEngine = Depends(get_inference_engine),
):
    """
    Convenience endpoint: directly analyze a backend business by its UUID.
    Fetches the business record from http://localhost:3000/api/v1/businesses/{id}.
    """
    biz = fetch_business_by_id(business_id)
    if not biz:
        raise HTTPException(
            status_code=404,
            detail=f"Business '{business_id}' not found in backend or backend is unreachable."
        )

    res = engine.analyze_location(
        state_name=biz.get("state", "Gujarat"),
        district_name=biz.get("district", "Anand"),
        subdistrict_name=biz.get("subdistrict"),
        business_category=biz.get("category_name", "Retail"),
    )
    return res


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("MODEL2_PORT", API_PORT))
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=False)
