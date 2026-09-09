"""
Deterministic Tool & Agent Pydantic Schemas.
Enforces strict contracts between AI Advisor, ML Models, Finance Engine, and RAG.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class Model1Result(BaseModel):
    location: str
    district: str
    potential_score: float
    tier: str
    top_categories: List[str] = Field(default_factory=list)

class Model2Result(BaseModel):
    business_type: str
    viability_score: float
    competition_level: str
    market_gap_score: float
    risk_level: str

class Model3Result(BaseModel):
    commodity: str
    location: str
    predicted_price_per_quintal: float
    lower_bound_90: float
    upper_bound_90: float
    reference_retail_price_per_kg: float
    unit: str = "quintal"

class FinanceResult(BaseModel):
    project_cost: float
    promoter_contribution: float
    subsidy_amount: float
    eligible_loan_amount: float
    interest_rate_pct: float
    tenure_months: int
    monthly_emi: float
    break_even_months: int

class RAGResult(BaseModel):
    query: str
    answer: str
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    should_abstain: bool = False
    confidence_level: str = "MEDIUM"
    freshness: str = "CURRENT"

class ToolExecutionResult(BaseModel):
    tool_name: str
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    latency_ms: float = 0.0

class AgentPlan(BaseModel):
    user_intent: str
    tools_required: List[str]
    planning_reason: str

class AdvisoryRequest(BaseModel):
    business_id: Optional[str] = Field(None, description="UUID of business to fetch from backend")
    user_query: str
    location: str = "Bankura, West Bengal"
    district: str = "Bankura"
    proposed_business: Optional[str] = "Potato Cold Storage & Trading"
    commodity: Optional[str] = "Potato"
    investment_amount: Optional[float] = 500000.0
    own_margin: Optional[float] = 100000.0
