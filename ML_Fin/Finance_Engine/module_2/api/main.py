"""
FastAPI REST API Service for GramBiz Finance Engine.
Exposes deterministic financial calculation endpoints for frontend & main backend consumption.
"""

import sys
from pathlib import Path
from typing import Dict, Any, List

# Ensure parent directory is in python path for package imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from finance_engine.models import (
    FinancialInput,
    FinancialResult,
    WorkingCapitalInput,
    WorkingCapitalResult,
    SchemeInfo
)
from finance_engine.calculator import FinanceCalculator
from finance_engine.schemes import SchemeRouter
from finance_engine.emi import calculate_monthly_emi
from finance_engine.repayment import generate_repayment_schedule
from finance_engine.working_capital import calculate_working_capital
from finance_engine.constants import (
    MICRO_FINANCE_SCHEME,
    TERM_LOAN_SCHEME,
    REPAYMENT_ASSUMPTION_NOTE,
    FINANCIAL_DISCLAIMER
)

app = FastAPI(
    title="GramBiz Finance Engine API",
    description="Deterministic Financial Planning & Scheme Eligibility Engine for Rural Entrepreneurs",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for frontend & main backend cross-origin access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request / Response Schemas for specialized endpoints
class EMIRequest(BaseModel):
    principal: float = Field(..., gt=0, description="Loan principal amount in INR")
    annual_interest_rate: float = Field(..., gt=0, le=1.0, description="Annual interest rate as decimal (e.g. 0.08)")
    tenure_months: int = Field(..., gt=0, le=360, description="Tenure in months")


class EMIResponse(BaseModel):
    principal: float
    annual_interest_rate: float
    tenure_months: int
    monthly_emi: float
    total_repayment: float
    total_interest: float


class RepaymentScheduleRequest(BaseModel):
    disbursed_loan: float = Field(..., gt=0)
    annual_interest_rate: float = Field(..., gt=0, le=1.0)
    tenure_months: int = Field(..., gt=0)
    moratorium_months: int = Field(default=0, ge=0)


class SchemeRouteRequest(BaseModel):
    project_cost: float = Field(..., gt=0, description="Total project cost in INR")


class SchemeRouteResponse(BaseModel):
    project_cost: float
    scheme: SchemeInfo
    eligible_loan: float
    is_within_scheme_limit: bool
    status_message: str


# Endpoints

@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
def health_check() -> Dict[str, str]:
    """Render and deployment health check endpoint."""
    return {
        "status": "ok",
        "service": "finance-engine",
        "version": "1.0.0"
    }


@app.post("/api/v1/finance/calculate", response_model=FinancialResult, tags=["Finance Engine"])
def calculate_financial_plan(input_data: FinancialInput) -> FinancialResult:
    """
    Primary endpoint: Takes available margin capital and optional business parameters,
    calculates total supported project cost, scheme eligibility, capped loan, EMI,
    amortization schedules, and working capital needs.
    """
    try:
        result = FinanceCalculator.calculate(input_data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Financial calculation error: {str(e)}"
        )


@app.post("/api/v1/finance/emi", response_model=EMIResponse, tags=["Finance Engine"])
def calculate_emi_endpoint(req: EMIRequest) -> EMIResponse:
    """Calculates EMI and total interest for a given principal, rate, and tenure."""
    monthly_emi = calculate_monthly_emi(req.principal, req.annual_interest_rate, req.tenure_months)
    total_repayment = round(monthly_emi * req.tenure_months, 2)
    total_interest = round(total_repayment - req.principal, 2)
    
    return EMIResponse(
        principal=req.principal,
        annual_interest_rate=req.annual_interest_rate,
        tenure_months=req.tenure_months,
        monthly_emi=monthly_emi,
        total_repayment=total_repayment,
        total_interest=max(0.0, total_interest)
    )


@app.post("/api/v1/finance/repayment-schedule", tags=["Finance Engine"])
def repayment_schedule_endpoint(req: RepaymentScheduleRequest) -> Dict[str, Any]:
    """Generates monthly and quarterly repayment schedules with moratorium handling."""
    (
        monthly,
        quarterly,
        emi,
        effective_p,
        total_int,
        total_rep
    ) = generate_repayment_schedule(
        disbursed_loan=req.disbursed_loan,
        annual_interest_rate=req.annual_interest_rate,
        tenure_months=req.tenure_months,
        moratorium_months=req.moratorium_months
    )

    return {
        "disbursed_loan": req.disbursed_loan,
        "effective_principal_after_moratorium": effective_p,
        "monthly_emi": emi,
        "total_interest": total_int,
        "total_repayment": total_rep,
        "monthly_schedule": [item.model_dump() for item in monthly],
        "quarterly_schedule": [item.model_dump() for item in quarterly],
        "repayment_assumption_note": REPAYMENT_ASSUMPTION_NOTE,
        "financial_disclaimer": FINANCIAL_DISCLAIMER
    }


@app.post("/api/v1/finance/working-capital", response_model=WorkingCapitalResult, tags=["Finance Engine"])
def working_capital_endpoint(req: WorkingCapitalInput) -> WorkingCapitalResult:
    """Calculates monthly operating cost, working capital requirement, and contingency."""
    return calculate_working_capital(req)


@app.post("/api/v1/finance/scheme", response_model=SchemeRouteResponse, tags=["Finance Engine"])
def route_scheme_endpoint(req: SchemeRouteRequest) -> SchemeRouteResponse:
    """Routes a project cost to Micro Finance, Term Loan, or Outside Range."""
    scheme_info, eligible_loan, is_within, msg = SchemeRouter.route_scheme(req.project_cost)
    return SchemeRouteResponse(
        project_cost=req.project_cost,
        scheme=scheme_info,
        eligible_loan=eligible_loan,
        is_within_scheme_limit=is_within,
        status_message=msg
    )


@app.get("/api/v1/schemes", tags=["Finance Engine"])
def list_schemes() -> Dict[str, Any]:
    """Returns official details of all government credit schemes."""
    return {
        "schemes": [
            MICRO_FINANCE_SCHEME,
            TERM_LOAN_SCHEME
        ],
        "repayment_assumption_note": REPAYMENT_ASSUMPTION_NOTE,
        "financial_disclaimer": FINANCIAL_DISCLAIMER
    }
