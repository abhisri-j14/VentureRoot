"""
Monthly Amortization Schedule and Quarterly Aggregation Engine.
Supports Moratorium Interest Capitalization (Option A).
"""

from typing import List, Tuple, Dict
from finance_engine.models import MonthlyRepaymentItem, QuarterlyRepaymentItem
from finance_engine.emi import calculate_monthly_emi
from finance_engine.utils import round_currency


def generate_repayment_schedule(
    disbursed_loan: float,
    annual_interest_rate: float,
    tenure_months: int,
    moratorium_months: int
) -> Tuple[List[MonthlyRepaymentItem], List[QuarterlyRepaymentItem], float, float, float, float]:
    """
    Generates monthly amortization schedule with moratorium capitalization,
    quarterly aggregated schedule, and overall interest/repayment metrics.
    
    Returns:
        Tuple of:
        - monthly_schedule: List[MonthlyRepaymentItem]
        - quarterly_schedule: List[QuarterlyRepaymentItem]
        - monthly_emi: float
        - effective_principal_after_moratorium: float
        - total_interest: float
        - total_repayment: float
    """
    monthly_schedule: List[MonthlyRepaymentItem] = []
    monthly_rate = annual_interest_rate / 12.0
    opening = disbursed_loan

    # 1. Moratorium Phase
    for m in range(1, moratorium_months + 1):
        interest = round_currency(opening * monthly_rate)
        principal = 0.0
        payment = 0.0
        closing = round_currency(opening + interest)
        
        monthly_schedule.append(
            MonthlyRepaymentItem(
                month=m,
                period=f"Month {m}",
                opening_balance=opening,
                interest=interest,
                principal=principal,
                payment=payment,
                closing_balance=closing,
                moratorium_flag=True
            )
        )
        opening = closing

    effective_principal_after_moratorium = opening
    repayment_months = tenure_months - moratorium_months

    # 2. Amortization Phase
    if repayment_months > 0 and effective_principal_after_moratorium > 0:
        monthly_emi = calculate_monthly_emi(
            effective_principal_after_moratorium,
            annual_interest_rate,
            repayment_months
        )
        
        for m in range(moratorium_months + 1, tenure_months + 1):
            interest = round_currency(opening * monthly_rate)
            
            # Final month exact reconciliation check
            if m == tenure_months:
                principal = opening
                payment = round_currency(principal + interest)
                closing = 0.0
            else:
                principal = round_currency(monthly_emi - interest)
                # Safeguard if EMI is smaller than interest (should not happen with normal parameters)
                if principal < 0:
                    principal = 0.0
                payment = round_currency(principal + interest)
                closing = round_currency(opening - principal)
                if closing < 0:
                    closing = 0.0

            monthly_schedule.append(
                MonthlyRepaymentItem(
                    month=m,
                    period=f"Month {m}",
                    opening_balance=opening,
                    interest=interest,
                    principal=principal,
                    payment=payment,
                    closing_balance=closing,
                    moratorium_flag=False
                )
            )
            opening = closing
    else:
        monthly_emi = 0.0

    # 3. Aggregations & Reconciliation
    total_interest = round_currency(sum(item.interest for item in monthly_schedule))
    total_repayment = round_currency(sum(item.payment for item in monthly_schedule))

    # 4. Quarterly Schedule Aggregation
    quarterly_schedule: List[QuarterlyRepaymentItem] = []
    num_quarters = (len(monthly_schedule) + 2) // 3

    for q in range(1, num_quarters + 1):
        start_idx = (q - 1) * 3
        end_idx = min(q * 3, len(monthly_schedule))
        q_items = monthly_schedule[start_idx:end_idx]

        if not q_items:
            continue

        q_opening = q_items[0].opening_balance
        q_principal = round_currency(sum(item.principal for item in q_items))
        q_interest = round_currency(sum(item.interest for item in q_items))
        q_payment = round_currency(sum(item.payment for item in q_items))
        q_closing = q_items[-1].closing_balance

        quarterly_schedule.append(
            QuarterlyRepaymentItem(
                quarter=f"Q{q}",
                opening_balance=q_opening,
                principal_paid=q_principal,
                interest_paid=q_interest,
                total_payment=q_payment,
                closing_balance=q_closing
            )
        )

    return (
        monthly_schedule,
        quarterly_schedule,
        monthly_emi,
        effective_principal_after_moratorium,
        total_interest,
        total_repayment
    )
