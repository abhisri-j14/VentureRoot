"""
GramBiz Model 1 -- FastAPI Inference Service
===============================================
Lightweight API that loads the trained model for predictions.
Does NOT retrain the model.

Endpoints:
    GET  /health
    GET  /model-info
    POST /api/v1/model1/predict
    POST /api/v1/model1/batch-predict
"""

import json
import logging
import os
import sys
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="GramBiz Model 1 API",
    description=(
        "Hyper-Local Market Potential & Demand Prediction Engine. "
        "Provides market potential scoring and ranking for rural/semi-urban "
        "Indian micro-enterprises. This model produces a Market Potential Index "
        "(MPI), NOT a prediction of business success or revenue."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model at startup ──────────────────────────────────────────
predictor = None


@app.on_event("startup")
def load_model():
    global predictor
    try:
        from src.models.predict import GramBizPredictor
        predictor = GramBizPredictor()
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        predictor = None


# ── Request/Response Models ────────────────────────────────────────

class PredictionRequest(BaseModel):
    state: str = Field(..., description="State name")
    district: str = Field(..., description="District name")
    subdistrict: Optional[str] = Field(None, description="Sub-district/block name")
    village: Optional[str] = Field(None, description="Village name")
    business_category: str = Field("Dairy", description="Business category")
    latitude: Optional[float] = Field(None, description="Latitude (for future use)")
    longitude: Optional[float] = Field(None, description="Longitude (for future use)")


class BatchPredictionRequest(BaseModel):
    predictions: List[PredictionRequest]


# ── Endpoints ──────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok" if predictor is not None else "model_not_loaded",
        "service": "grambiz-model1",
        "version": "1.0.0",
    }


@app.get("/model-info")
def model_info():
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "model_name": predictor.metadata.get("model_name"),
        "model_type": predictor.metadata.get("model_type"),
        "version": predictor.metadata.get("version"),
        "target_definition": predictor.metadata.get("target_definition"),
        "is_supervised_label": predictor.metadata.get("is_supervised_label"),
        "is_constructed_index": predictor.metadata.get("is_constructed_index"),
        "feature_count": predictor.metadata.get("feature_count"),
        "training_rows": predictor.metadata.get("training_rows"),
        "geographic_level": predictor.metadata.get("geographic_level"),
        "dataset_versions": predictor.metadata.get("dataset_versions"),
        "limitations": predictor.metadata.get("limitations"),
        "holdout_metrics": predictor.metadata.get("holdout_metrics"),
    }


@app.post("/api/v1/model1/predict")
def predict(req: PredictionRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    result = predictor.predict(
        state=req.state,
        district=req.district,
        subdistrict=req.subdistrict,
        village=req.village,
        business_category=req.business_category,
        latitude=req.latitude,
        longitude=req.longitude,
    )
    return result


@app.post("/api/v1/model1/batch-predict")
def batch_predict(req: BatchPredictionRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    results = []
    for pred_req in req.predictions:
        result = predictor.predict(
            state=pred_req.state,
            district=pred_req.district,
            subdistrict=pred_req.subdistrict,
            village=pred_req.village,
            business_category=pred_req.business_category,
            latitude=pred_req.latitude,
            longitude=pred_req.longitude,
        )
        results.append(result)

    return {"predictions": results, "count": len(results)}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("MODEL1_PORT", 8001))
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=True)
