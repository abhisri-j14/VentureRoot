"""
Centralized Scheme Definitions and Constants.
STRICT RULE: All financial scheme rules, rates, limits, and parameters are defined here.
No LLM or external source is used for financial calculations or scheme terms.
"""

from typing import Dict, Any, List

# Beneficiary Contribution Percentage (10%)
BENEFICIARY_MARGIN_FRACTION = 0.10
AGENCY_LOAN_FRACTION = 0.90

# Scheme Specifications
MICRO_FINANCE_SCHEME_NAME = "Micro Finance Scheme"
TERM_LOAN_SCHEME_NAME = "Term Loan Scheme"
OUTSIDE_SCHEME_RANGE_NAME = "Outside Scheme Range"

MICRO_FINANCE_SCHEME: Dict[str, Any] = {
    "scheme_id": "micro_finance",
    "name": MICRO_FINANCE_SCHEME_NAME,
    "min_project_cost": 0.0,
    "max_project_cost": 140000.0,  # <= ₹1.40 Lakh
    "beneficiary_contribution_pct": 0.10,
    "loan_percentage": 0.90,
    "max_loan": 125000.0,          # Max ₹1.25 Lakh
    "interest_rate": 0.065,        # 6.5% p.a.
    "tenure_years": 3,             # 3 Years (36 months)
    "tenure_months": 36,
    "moratorium_months": 3,        # 3 Months moratorium
}

TERM_LOAN_SCHEME: Dict[str, Any] = {
    "scheme_id": "term_loan",
    "name": TERM_LOAN_SCHEME_NAME,
    "min_project_cost": 140000.0,  # > ₹1.40 Lakh
    "max_project_cost": 5000000.0, # <= ₹50.00 Lakh
    "beneficiary_contribution_pct": 0.10,
    "loan_percentage": 0.90,
    "max_loan": 4500000.0,         # Max ₹45.00 Lakh
    "interest_rate": 0.08,         # 8.0% p.a.
    "tenure_years": 7,             # 7 Years (84 months)
    "tenure_months": 84,
    "moratorium_months": 6,        # 6 Months moratorium
}

MAX_SCHEME_PROJECT_COST = 5000000.0  # ₹50 Lakhs
MIN_PRACTICAL_PROJECT_COST = 10000.0  # ₹10,000 practical limit warning threshold

# Repayment Assumption Note (Single Canonical Field)
REPAYMENT_ASSUMPTION_NOTE = (
    "Repayment assumption: The stated tenure includes the moratorium period. "
    "Interest accrued during the moratorium is capitalized before EMI repayment begins. "
    "Actual lender terms may vary."
)

# Official Financial Disclaimer
FINANCIAL_DISCLAIMER = (
    "This tool provides an indicative financial calculation based on the scheme parameters configured in GramBiz. "
    "Actual sanction, interest calculation, moratorium treatment, repayment schedule and eligibility are subject "
    "to the financing agency's applicable rules and final approval."
)

BUSINESS_CATEGORIES: List[str] = [
    "Dairy",
    "Poultry",
    "Agriculture",
    "Food Processing",
    "Retail",
    "Textiles",
    "Tailoring",
    "Handicrafts",
    "Small Manufacturing",
    "Repair Services",
    "Transportation",
    "Beauty/Personal Care",
    "Other"
]
