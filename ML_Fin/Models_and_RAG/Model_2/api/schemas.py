"""
GramBiz Model 2 -- FastAPI Pydantic Schemas
============================================
Data validation schemas for API request inputs and structured output payloads.
Supports direct parameter passing, field aliases, and business_id resolution
against the authoritative VentureRoot backend business files.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    # Optional business_id to fetch details from backend API
    business_id: Optional[str] = Field(None, description="UUID of business to fetch from backend")

    # Primary fields
    state_name: Optional[str] = Field(None, description="State name")
    district_name: Optional[str] = Field(None, description="District name")
    subdistrict_name: Optional[str] = Field(None, description="Sub-district / Block name")
    business_category: Optional[str] = Field(None, description="Business category")

    # Backend field aliases for seamless compatibility
    state: Optional[str] = Field(None, description="Alias for state_name")
    district: Optional[str] = Field(None, description="Alias for district_name")
    subdistrict: Optional[str] = Field(None, description="Alias for subdistrict_name")
    block: Optional[str] = Field(None, description="Alias for subdistrict_name")
    village: Optional[str] = Field(None, description="Village name")
    businessCategory: Optional[str] = Field(None, description="Alias for business_category")

    def get_state(self) -> str:
        return (self.state_name or self.state or "Gujarat").strip()

    def get_district(self) -> str:
        return (self.district_name or self.district or "Anand").strip()

    def get_subdistrict(self) -> Optional[str]:
        val = self.subdistrict_name or self.subdistrict or self.block
        return val.strip() if val else None

    def get_category(self) -> str:
        return (self.business_category or self.businessCategory or "Retail").strip()


class CategoryScoreDetail(BaseModel):
    rank: int = 1
    category: str = "Retail"
    opportunity_score: float = 50.0
    demand_proxy_score: float = 50.0
    competition_score: float = 50.0
    risk_score: float = 50.0
    category_specific_competition_available: bool = False
    observed_competitor_count: Optional[int] = None
    positive_factors: List[str] = Field(default_factory=list)
    risk_factors: List[str] = Field(default_factory=list)
    data_warnings: List[str] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    status: Optional[str] = "SUCCESS"
    model_version: str = "1.0.0"
    methodology_version: str = "1.0.0"
    location: Dict[str, str] = Field(default_factory=dict)
    data_resolution: Optional[str] = "subdistrict"
    overall_viability_score: float = 50.0
    score_band: str = "Moderate Opportunity"
    confidence: str = "Moderate"
    data_completeness: float = 0.5
    ood: bool = False
    selected_category: str = "Retail"
    selected_category_analysis: Optional[CategoryScoreDetail] = None
    category_rankings: List[CategoryScoreDetail] = Field(default_factory=list)
    geospatial_radius_available: bool = False
    competitor_density_available: bool = False
    data_sources: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


class CategoryListResponse(BaseModel):
    total_categories: int
    categories: List[str]


class HealthResponse(BaseModel):
    status: str
    service: str
    model_version: str
    methodology_version: str
