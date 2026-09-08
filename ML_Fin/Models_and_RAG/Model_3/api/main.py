"""
GramBiz Model 3 — FastAPI REST Application Server
===================================================
Exposes versioned REST endpoints for local market price prediction, health status, and metadata.
Default Port: 8003.
"""

import os
import sys
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from api.schemas import PricePredictionRequest, PricePredictionResponse, CategoryListResponse, HealthStatusResponse
from api.dependencies import get_inference_engine
from src.inference.engine import Model3InferenceEngine
from src.utils.config import API_PORT, MODEL_VERSION, METHODOLOGY_VERSION, CANONICAL_PRICE_UNIT
from src.utils.logger import get_logger

logger = get_logger("Model3API")

app = FastAPI(
    title="GramBiz Model 3 — Local Market Price Prediction Engine API",
    description="Provides realistic observed local market price predictions (₹/quintal) with conformal prediction intervals and OOD detection.",
    version=MODEL_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthStatusResponse)
@app.get("/health", response_model=HealthStatusResponse)
@app.get("/api/v1/health", response_model=HealthStatusResponse)
def health_check(engine: Model3InferenceEngine = Depends(get_inference_engine)):
    """Health check endpoint returning service status and model versions."""
    return HealthStatusResponse(
        status="ok",
        service="GramBiz Model 3 — Local Market Price Prediction Engine",
        model_version=MODEL_VERSION,
        methodology_version=METHODOLOGY_VERSION,
        model_loaded=True
    )


@app.get("/model-info")
@app.get("/api/v1/model-info")
def model_info(engine: Model3InferenceEngine = Depends(get_inference_engine)):
    """Returns detailed model metadata and governance configuration."""
    return engine.metadata


@app.get("/categories", response_model=CategoryListResponse)
@app.get("/api/v1/categories", response_model=CategoryListResponse)
def get_supported_categories(engine: Model3InferenceEngine = Depends(get_inference_engine)):
    """Lists supported commodities, states, and APMC markets."""
    known_locs = engine.metadata.get("known_locations", {})
    commodities = known_locs.get("commodities", [])
    markets = known_locs.get("markets", [])
    states = known_locs.get("states", [])

    return CategoryListResponse(
        total_commodities=len(commodities),
        commodities=commodities,
        total_markets=len(markets),
        total_states=len(states)
    )


@app.post("/predict")
@app.post("/api/v1/predict")
def predict_local_price(
    req: PricePredictionRequest,
    engine: Model3InferenceEngine = Depends(get_inference_engine)
):
    """Executes price prediction with conformal bounds and OOD detection."""
    try:
        res = engine.predict(
            state=req.state,
            district=req.district,
            market=req.market,
            commodity=req.commodity,
            variety=req.variety,
            grade=req.grade,
            prediction_date=req.prediction_date,
            recent_observed_price=req.recent_observed_price
        )

        # Standard contract field overrides
        res["target_unit"] = CANONICAL_PRICE_UNIT
        res["predicted_price"] = res["expected_market_price"]
        return res
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=API_PORT, reload=False)
