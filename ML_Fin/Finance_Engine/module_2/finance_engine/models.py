"""
Pydantic Data Models for Financial Calculator and Scheme Router.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, field_validator
from finance_engine.constants import (
    REPAYMENT_ASSUMPTION_NOTE,
    FINANCIAL_DISCLAIMER,
    BUSINESS_CATEGORIES
)


class FinancialInput(BaseModel):
    available_margin: float = Field(
        ...,
        description="Available margin capital contributed by the beneficiary (in INR)",
        gt=0
    )
    business_category: str = Field(
        default="Other",
        description="Business category for report organization"
    )
    proposed_project_cost: Optional[float] = Field(
        default=None,
        description="Optional user-specified proposed project budget (in INR)",
        ge=0
    )
    monthly_revenue: Optional[float] = Field(default=0.0, ge=0)
    monthly_operating_cost: Optional[float] = Field(default=0.0, ge=0)
    initial_inventory: Optional[float] = Field(default=0.0, ge=0)
    fixed_asset_cost: Optional[float] = Field(default=0.0, ge=0)
    working_capital_months: int = Field(default=3, ge=1, le=12)
    contingency_percentage: float = Field(default=5.0, ge=0.0, le=50.0)

    @field_validator("business_category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in BUSINESS_CATEGORIES:
            return "Other"
        return v


class SchemeInfo(BaseModel):
    scheme_id: str
    name: str
    min_project_cost: float
    max_project_cost: float
    beneficiary_contribution_pct: float
    loan_percentage: float
    max_loan: float
    interest_rate: float
    tenure_years: int
    tenure_months: int
    moratorium_months: int


class MonthlyRepaymentItem(BaseModel):
    month: int
    period: str
    opening_balance: float
    interest: float
    principal: float
    payment: float
    closing_balance: float
    moratorium_flag: bool


class QuarterlyRepaymentItem(BaseModel):
    quarter: str
    opening_balance: float
    principal_paid: float
    interest_paid: float
    total_payment: float
    closing_balance: float


class WorkingCapitalInput(BaseModel):
    fixed_assets: float = Field(default=0.0, ge=0.0)
    initial_inventory: float = Field(default=0.0, ge=0.0)
    raw_material: float = Field(default=0.0, ge=0.0)
    wages: float = Field(default=0.0, ge=0.0)
    rent: float = Field(default=0.0, ge=0.0)
    utilities: float = Field(default=0.0, ge=0.0)
    transport: float = Field(default=0.0, ge=0.0)
    marketing: float = Field(default=0.0, ge=0.0)
    maintenance: float = Field(default=0.0, ge=0.0)
    other_expenses: float = Field(default=0.0, ge=0.0)
    coverage_months: int = Field(default=3, ge=1, le=12)
    contingency_pct: float = Field(default=5.0, ge=0.0, le=50.0)


class WorkingCapitalResult(BaseModel):
    monthly_operating_cost: float
    working_capital_requirement: float
    contingency_amount: float
    total_project_requirement: float
    cost_breakdown: Dict[str, float]


class FinancialResult(BaseModel):
    available_margin: float
    calculated_project_cost: float
    beneficiary_contribution: float
    calculated_loan: float
    eligible_loan: float
    is_within_scheme_limit: bool
    scheme: SchemeInfo
    interest_rate: float
    tenure_years: int
    tenure_months: int
    moratorium_months: int
    monthly_emi: float
    effective_principal_after_moratorium: float
    total_interest: float
    total_repayment: float
    monthly_repayment_schedule: List[MonthlyRepaymentItem]
    quarterly_repayment_schedule: List[QuarterlyRepaymentItem]
    working_capital: Optional[WorkingCapitalResult] = None
    proposed_project_cost: Optional[float] = None
    margin_shortfall: float = 0.0
    required_margin_for_proposed: float = 0.0
    warnings: List[str] = Field(default_factory=list)
    explanatory_notes: List[str] = Field(default_factory=list)
    repayment_assumption_note: str = REPAYMENT_ASSUMPTION_NOTE
    financial_disclaimer: str = FINANCIAL_DISCLAIMER
