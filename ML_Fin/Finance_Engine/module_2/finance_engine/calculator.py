"""
Master FinanceEngine Orchestrator.
Combines input validation, scheme routing, loan capping, EMI math,
repayment schedules, working capital, and shortfall analysis.
"""

from typing import Optional, List
from finance_engine.models import (
    FinancialInput,
    FinancialResult,
    WorkingCapitalInput,
    WorkingCapitalResult
)
from finance_engine.constants import (
    BENEFICIARY_MARGIN_FRACTION,
    AGENCY_LOAN_FRACTION,
    REPAYMENT_ASSUMPTION_NOTE,
    FINANCIAL_DISCLAIMER
)
from finance_engine.validation import validate_financial_input
from finance_engine.schemes import SchemeRouter
from finance_engine.repayment import generate_repayment_schedule
from finance_engine.working_capital import calculate_working_capital
from finance_engine.utils import round_currency, format_inr


class FinanceCalculator:
    """
    Primary calculation engine service for GramBiz Finance.
    """

    @staticmethod
    def calculate(financial_input: FinancialInput) -> FinancialResult:
        """
        Executes complete financial planning analysis from available margin capital.
        """
        # 1. Validation & Warnings
        warnings = validate_financial_input(
            financial_input.available_margin,
            financial_input.proposed_project_cost
        )

        available_margin = round_currency(financial_input.available_margin)
        
        # 2. Margin & Project Cost Calculations
        calculated_project_cost = round_currency(available_margin / BENEFICIARY_MARGIN_FRACTION)
        beneficiary_contribution = available_margin
        calculated_loan = round_currency(calculated_project_cost * AGENCY_LOAN_FRACTION)

        # 3. Scheme Routing & Eligible Loan Capping
        scheme_info, eligible_loan, is_within_limit, scheme_status_msg = SchemeRouter.route_scheme(
            calculated_project_cost
        )
        
        if not is_within_limit:
            warnings.append(scheme_status_msg)

        # 4. Amortization & Moratorium Schedule Generation
        (
            monthly_schedule,
            quarterly_schedule,
            monthly_emi,
            effective_principal_after_moratorium,
            total_interest,
            total_repayment
        ) = generate_repayment_schedule(
            disbursed_loan=eligible_loan,
            annual_interest_rate=scheme_info.interest_rate,
            tenure_months=scheme_info.tenure_months,
            moratorium_months=scheme_info.moratorium_months
        )

        # 5. Optional Proposed Project Budget & Shortfall Analysis
        margin_shortfall = 0.0
        required_margin_for_proposed = 0.0
        proposed_cost = financial_input.proposed_project_cost

        if proposed_cost is not None and proposed_cost > 0:
            proposed_cost = round_currency(proposed_cost)
            required_margin_for_proposed = round_currency(proposed_cost * BENEFICIARY_MARGIN_FRACTION)
            if available_margin < required_margin_for_proposed:
                margin_shortfall = round_currency(required_margin_for_proposed - available_margin)

        # 6. Working Capital Assessment (if inputs provided)
        working_capital_res: Optional[WorkingCapitalResult] = None
        
        # Check if working capital details exist
        has_wc_details = any([
            financial_input.monthly_operating_cost and financial_input.monthly_operating_cost > 0,
            financial_input.fixed_asset_cost and financial_input.fixed_asset_cost > 0,
            financial_input.initial_inventory and financial_input.initial_inventory > 0
        ])

        if has_wc_details:
            wc_input = WorkingCapitalInput(
                fixed_assets=financial_input.fixed_asset_cost or 0.0,
                initial_inventory=financial_input.initial_inventory or 0.0,
                other_expenses=financial_input.monthly_operating_cost or 0.0,
                coverage_months=financial_input.working_capital_months,
                contingency_pct=financial_input.contingency_percentage
            )
            working_capital_res = calculate_working_capital(wc_input)
            
            # Check if estimated business requirement exceeds calculated project cost
            if working_capital_res.total_project_requirement > calculated_project_cost:
                warnings.append(
                    f"Your estimated total business requirement ({format_inr(working_capital_res.total_project_requirement)}) "
                    f"exceeds the project cost supported by your current margin ({format_inr(calculated_project_cost)})."
                )

        # 7. Rural Entrepreneur Explanatory Notes
        explanatory_notes: List[str] = [
            f"Your available margin of {format_inr(available_margin)} represents 10% beneficiary contribution.",
            f"This margin supports a maximum project cost of {format_inr(calculated_project_cost)}.",
            f"90% financing agency loan eligibility is {format_inr(eligible_loan)} under the {scheme_info.name}.",
            f"Interest rate is {scheme_info.interest_rate * 100:.1f}% p.a. over {scheme_info.tenure_years} years ({scheme_info.tenure_months} months).",
            f"Moratorium duration is {scheme_info.moratorium_months} months (Interest accrued during moratorium is capitalized into principal before EMI begins)."
        ]

        return FinancialResult(
            available_margin=available_margin,
            calculated_project_cost=calculated_project_cost,
            beneficiary_contribution=beneficiary_contribution,
            calculated_loan=calculated_loan,
            eligible_loan=eligible_loan,
            is_within_scheme_limit=is_within_limit,
            scheme=scheme_info,
            interest_rate=scheme_info.interest_rate,
            tenure_years=scheme_info.tenure_years,
            tenure_months=scheme_info.tenure_months,
            moratorium_months=scheme_info.moratorium_months,
            monthly_emi=monthly_emi,
            effective_principal_after_moratorium=effective_principal_after_moratorium,
            total_interest=total_interest,
            total_repayment=total_repayment,
            monthly_repayment_schedule=monthly_schedule,
            quarterly_repayment_schedule=quarterly_schedule,
            working_capital=working_capital_res,
            proposed_project_cost=proposed_cost,
            margin_shortfall=margin_shortfall,
            required_margin_for_proposed=required_margin_for_proposed,
            warnings=warnings,
            explanatory_notes=explanatory_notes,
            repayment_assumption_note=REPAYMENT_ASSUMPTION_NOTE,
            financial_disclaimer=FINANCIAL_DISCLAIMER
        )
