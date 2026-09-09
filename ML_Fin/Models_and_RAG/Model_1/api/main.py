"""
GramBiz Model 1 -- FastAPI Inference Service
===============================================
Lightweight API that loads the trained model for predictions.
Does NOT retrain the model.
Supports querying authoritative business records from the Next.js backend.

Endpoints:
    GET  /health
    GET  /model-info
    POST /api/v1/model1/predict
    POST /api/v1/predict (alias)
    GET  /api/v1/model1/predict/{business_id}
    POST /api/v1/model1/batch-predict
"""

import json
import logging
import os
import sys
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Add project root and ML_Fin root to path
CURRENT_DIR = Path(__file__).resolve().parent
MODEL1_ROOT = CURRENT_DIR.parent
ML_FIN_ROOT = MODEL1_ROOT.parent.parent
if str(MODEL1_ROOT) not in sys.path:
    sys.path.insert(0, str(MODEL1_ROOT))
if str(ML_FIN_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_FIN_ROOT))

from common.backend_client import fetch_business_by_id

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="GramBiz Model 1 API",
    description=(
        "Hyper-Local Market Potential & Demand Prediction Engine. "
        "Provides market potential scoring and ranking for rural/semi-urban "
        "Indian micro-enterprises."
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


def get_predictor():
    global predictor
    if predictor is None:
        try:
            from src.models.predict import GramBizPredictor
            predictor = GramBizPredictor()
            logger.info("Model 1 predictor loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Model 1 predictor: {e}")
            predictor = None
    return predictor


@app.on_event("startup")
def load_model():
    get_predictor()


# ── Request/Response Models ────────────────────────────────────────

class PredictionRequest(BaseModel):
    # Optional business_id to query backend directly
    business_id: Optional[str] = Field(None, description="UUID of business in backend database")

    # Primary fields
    state: Optional[str] = Field(None, description="State name")
    district: Optional[str] = Field(None, description="District name")
    subdistrict: Optional[str] = Field(None, description="Sub-district/block name")
    village: Optional[str] = Field(None, description="Village name")
    business_category: Optional[str] = Field(None, description="Business category")
    latitude: Optional[float] = Field(None, description="Latitude (for future use)")
    longitude: Optional[float] = Field(None, description="Longitude (for future use)")

    # Aliases for seamless integration with backend requests
    state_name: Optional[str] = Field(None, description="Alias for state")
    district_name: Optional[str] = Field(None, description="Alias for district")
    subdistrict_name: Optional[str] = Field(None, description="Alias for subdistrict")
    block: Optional[str] = Field(None, description="Alias for subdistrict")
    businessCategory: Optional[str] = Field(None, description="Alias for business_category")

    def get_state(self) -> str:
        return (self.state or self.state_name or "Gujarat").strip()

    def get_district(self) -> str:
        return (self.district or self.district_name or "Anand").strip()

    def get_subdistrict(self) -> Optional[str]:
        val = self.subdistrict or self.subdistrict_name or self.block
        return val.strip() if val else None

    def get_category(self) -> str:
        return (self.business_category or self.businessCategory or "Dairy").strip()


class BatchPredictionRequest(BaseModel):
    predictions: List[PredictionRequest]


# ── Endpoints ──────────────────────────────────────────────────────

@app.get("/health")
def health():
    pred = get_predictor()
    return {
        "status": "ok" if pred is not None else "model_not_loaded",
        "service": "grambiz-model1",
        "version": "1.0.0",
    }


@app.get("/model-info")
def model_info():
    pred = get_predictor()
    if pred is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "model_name": pred.metadata.get("model_name"),
        "model_type": pred.metadata.get("model_type"),
        "version": pred.metadata.get("version"),
        "target_definition": pred.metadata.get("target_definition"),
        "is_supervised_label": pred.metadata.get("is_supervised_label"),
        "is_constructed_index": pred.metadata.get("is_constructed_index"),
        "feature_count": pred.metadata.get("feature_count"),
        "training_rows": pred.metadata.get("training_rows"),
        "geographic_level": pred.metadata.get("geographic_level"),
        "dataset_versions": pred.metadata.get("dataset_versions"),
        "limitations": pred.metadata.get("limitations"),
        "holdout_metrics": pred.metadata.get("holdout_metrics"),
    }


@app.post("/api/v1/model1/predict")
@app.post("/api/v1/predict")
def predict(req: PredictionRequest):
    pred = get_predictor()
    if pred is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    state = req.get_state()
    district = req.get_district()
    subdistrict = req.get_subdistrict()
    village = req.village
    business_category = req.get_category()
    latitude = req.latitude
    longitude = req.longitude

    # If business_id is passed, fetch authoritative context from backend
    if req.business_id:
        biz = fetch_business_by_id(req.business_id)
        if biz:
            state = biz.get("state") or state
            district = biz.get("district") or district
            subdistrict = biz.get("subdistrict") or subdistrict
            village = biz.get("village") or village
            business_category = biz.get("category_name") or business_category
            latitude = biz.get("latitude") if biz.get("latitude") is not None else latitude
            longitude = biz.get("longitude") if biz.get("longitude") is not None else longitude

    result = pred.predict(
        state=state,
        district=district,
        subdistrict=subdistrict,
        village=village,
        business_category=business_category,
        latitude=latitude,
        longitude=longitude,
    )
    return result


@app.get("/api/v1/model1/predict/{business_id}")
def predict_by_business_id(business_id: str):
    """Directly predict for a backend business by UUID."""
    pred = get_predictor()
    if pred is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    biz = fetch_business_by_id(business_id)
    if not biz:
        raise HTTPException(
            status_code=404,
            detail=f"Business '{business_id}' not found in backend."
        )

    result = pred.predict(
        state=biz.get("state", "Gujarat"),
        district=biz.get("district", "Anand"),
        subdistrict=biz.get("subdistrict"),
        village=biz.get("village"),
        business_category=biz.get("category_name", "Dairy"),
        latitude=biz.get("latitude"),
        longitude=biz.get("longitude"),
    )
    return result


@app.post("/api/v1/model1/batch-predict")
def batch_predict(req: BatchPredictionRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    results = []
    for pred_req in req.predictions:
        res = predict(pred_req)
        results.append(res)

    return {"predictions": results, "count": len(results)}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("MODEL1_PORT", 8001))
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=False)
