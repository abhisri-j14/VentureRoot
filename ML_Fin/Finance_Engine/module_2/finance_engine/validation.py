"""
Validation logic and custom financial warnings for input data.
"""

from typing import List, Tuple
from finance_engine.constants import (
    MIN_PRACTICAL_PROJECT_COST,
    MAX_SCHEME_PROJECT_COST,
    BENEFICIARY_MARGIN_FRACTION
)
from finance_engine.utils import format_inr


class FinancialValidationError(ValueError):
    """Custom exception for invalid financial inputs."""
    pass


def validate_financial_input(available_margin: float, proposed_project_cost: float = None) -> List[str]:
    """
    Validates user financial inputs and returns warnings if applicable.
    Raises FinancialValidationError for invalid zero or negative margin.
    """
    warnings: List[str] = []

    if available_margin is None or available_margin <= 0:
        raise FinancialValidationError("Positive margin capital is required to calculate project cost and scheme eligibility.")

    calculated_project_cost = available_margin / BENEFICIARY_MARGIN_FRACTION

    if calculated_project_cost < MIN_PRACTICAL_PROJECT_COST:
        warnings.append(
            f"Available margin of {format_inr(available_margin)} yields a project cost of "
            f"{format_inr(calculated_project_cost)}, which is below the practical micro-loan threshold "
            f"of {format_inr(MIN_PRACTICAL_PROJECT_COST)}."
        )

    if calculated_project_cost > MAX_SCHEME_PROJECT_COST:
        warnings.append(
            f"Calculated project cost ({format_inr(calculated_project_cost)}) exceeds the maximum "
            f"supported scheme limit of {format_inr(MAX_SCHEME_PROJECT_COST)}."
        )

    if proposed_project_cost is not None and proposed_project_cost > 0:
        required_margin = proposed_project_cost * BENEFICIARY_MARGIN_FRACTION
        if available_margin < required_margin:
            shortfall = required_margin - available_margin
            warnings.append(
                f"Your current margin ({format_inr(available_margin)}) is insufficient by "
                f"{format_inr(shortfall)} for your proposed project budget of {format_inr(proposed_project_cost)}."
            )

    return warnings
