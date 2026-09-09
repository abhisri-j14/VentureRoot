"""
Working Capital and Operational Cost Calculator.
"""

from typing import Dict
from finance_engine.models import WorkingCapitalInput, WorkingCapitalResult
from finance_engine.utils import round_currency


def calculate_working_capital(input_data: WorkingCapitalInput) -> WorkingCapitalResult:
    """
    Computes monthly operating cost, working capital requirement,
    contingency, and total initial capital requirement.
    """
    cost_breakdown: Dict[str, float] = {
        "Raw Material": round_currency(input_data.raw_material),
        "Wages & Labour": round_currency(input_data.wages),
        "Rent": round_currency(input_data.rent),
        "Utilities": round_currency(input_data.utilities),
        "Transportation": round_currency(input_data.transport),
        "Marketing": round_currency(input_data.marketing),
        "Maintenance": round_currency(input_data.maintenance),
        "Other Expenses": round_currency(input_data.other_expenses)
    }

    monthly_operating_cost = round_currency(sum(cost_breakdown.values()))
    working_capital_requirement = round_currency(monthly_operating_cost * input_data.coverage_months)
    
    subtotal = (
        round_currency(input_data.fixed_assets) +
        round_currency(input_data.initial_inventory) +
        working_capital_requirement
    )
    
    contingency_amount = round_currency(subtotal * (input_data.contingency_pct / 100.0))
    total_project_requirement = round_currency(subtotal + contingency_amount)

    return WorkingCapitalResult(
        monthly_operating_cost=monthly_operating_cost,
        working_capital_requirement=working_capital_requirement,
        contingency_amount=contingency_amount,
        total_project_requirement=total_project_requirement,
        cost_breakdown=cost_breakdown
    )
