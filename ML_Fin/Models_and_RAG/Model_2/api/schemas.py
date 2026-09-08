"""
GramBiz Model 2 -- FastAPI Pydantic Schemas
============================================
Data validation schemas for API request inputs and structured output payloads.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    state_name: str = Field(...)
    district_name: str = Field(...)
    subdistrict_name: Optional[str] = Field(None)
    business_category: Optional[str] = Field(None)


class CategoryScoreDetail(BaseModel):
    rank: int
    category: str
    opportunity_score: float
    demand_proxy_score: float
    competition_score: float
    risk_score: float
    category_specific_competition_available: bool
    observed_competitor_count: Optional[int] = None
    positive_factors: List[str]
    risk_factors: List[str]
    data_warnings: List[str]


class AnalysisResponse(BaseModel):
    model_version: str
    methodology_version: str
    location: Dict[str, str]
    overall_viability_score: float
    score_band: str
    confidence: str
    data_completeness: float
    ood: bool
    selected_category: str
    selected_category_analysis: Optional[CategoryScoreDetail] = None
    category_rankings: List[CategoryScoreDetail]
    geospatial_radius_available: bool = False
    competitor_density_available: bool = False
    data_sources: List[str]
    warnings: List[str]
    limitations: List[str]


class CategoryListResponse(BaseModel):
    total_categories: int
    categories: List[str]


class HealthResponse(BaseModel):
    status: str
    service: str
    model_version: str
    methodology_version: str
