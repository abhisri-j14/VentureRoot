"""
GramBiz Model 3 — FastAPI Request & Response Schemas
=====================================================
Strict Pydantic schemas enforcing input validation bounds and output contracts.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class PricePredictionRequest(BaseModel):
    state: str = Field(..., min_length=2, example="West Bengal")
    district: str = Field(..., min_length=2, example="Bankura")
    market: str = Field(..., min_length=2, example="Bankura APMC")
    commodity: str = Field(..., min_length=2, example="Potato")
    variety: Optional[str] = Field(None, example="Jyoti")
    grade: Optional[str] = Field(None, example="FAQ")
    prediction_date: Optional[str] = Field(None, example="2026-09-05")
    recent_observed_price: Optional[float] = Field(None, ge=0.0, le=100000.0, example=2200.0)


class PriceRange(BaseModel):
    lower: float
    upper: float


class ProductInfo(BaseModel):
    commodity: str
    variety: str
    grade: str


class LocationInfo(BaseModel):
    state: str
    district: str
    market: str


class PredictionIntervalInfo(BaseModel):
    coverage: float
    lower: float
    upper: float
    display_range: str
    width: float


class PricePredictionResponse(BaseModel):
    model_version: str
    methodology_version: str
    feature_version: str
    price_prediction_available: bool
    product: ProductInfo
    location: LocationInfo
    prediction_date: str
    expected_market_price: float
    display_expected_market_price: str
    target_unit: str
    price_unit: str
    prediction_interval: PredictionIntervalInfo
    reference_selling_price: float
    display_reference_selling_price: str
    pricing_method: str
    model_confidence: str
    prediction_reliability: str
    data_completeness: float
    data_as_of: str
    latest_observation_date: str
    days_since_latest_observation: int
    ood_checks: Dict[str, Any]
    positive_price_drivers: List[str]
    negative_price_drivers: List[str]
    warnings: List[str]
    limitations: List[str]
    disclaimer: str


class HealthStatusResponse(BaseModel):
    status: str
    service: str
    model_version: str
    methodology_version: str
    model_loaded: bool


class CategoryListResponse(BaseModel):
    total_commodities: int
    commodities: List[str]
    total_markets: int
    total_states: int
