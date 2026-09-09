"""
Mathematical EMI Calculation Engine.
Strictly deterministic python mathematical calculation.
"""

from decimal import Decimal, ROUND_HALF_UP
from finance_engine.utils import round_currency


def calculate_monthly_emi(principal: float, annual_interest_rate: float, tenure_months: int) -> float:
    """
    Calculates exact Equated Monthly Installment (EMI) using standard amortization formula.
    
    Formula:
        EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        
    Args:
        principal: Loan principal amount (INR)
        annual_interest_rate: Annual rate as decimal (e.g. 0.08 for 8%)
        tenure_months: Number of monthly repayment periods
        
    Returns:
        Monthly EMI amount rounded to 2 decimal places.
    """
    if principal <= 0 or tenure_months <= 0:
        return 0.0

    monthly_rate = annual_interest_rate / 12.0
    
    if monthly_rate == 0:
        return round_currency(principal / tenure_months)

    p = Decimal(str(principal))
    r = Decimal(str(monthly_rate))
    n = tenure_months

    one_plus_r_pow_n = (Decimal("1") + r) ** n
    numerator = p * r * one_plus_r_pow_n
    denominator = one_plus_r_pow_n - Decimal("1")

    emi_decimal = numerator / denominator
    return float(emi_decimal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
