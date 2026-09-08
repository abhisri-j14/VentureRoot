"""
Scheme Routing Engine and Scheme Evaluation Logic.
All rules are strictly sourced from constants.py.
"""

from typing import Tuple, Dict, Any
from finance_engine.constants import (
    MICRO_FINANCE_SCHEME,
    TERM_LOAN_SCHEME,
    OUTSIDE_SCHEME_RANGE_NAME,
    MAX_SCHEME_PROJECT_COST,
    AGENCY_LOAN_FRACTION
)
from finance_engine.models import SchemeInfo
from finance_engine.utils import format_inr


class SchemeRouter:
    """
    Evaluates project cost against government scheme boundaries and returns
    the applicable scheme metadata, eligible loan amount, and status flags.
    """

    @staticmethod
    def route_scheme(project_cost: float) -> Tuple[SchemeInfo, float, bool, str]:
        """
        Routes the given project cost to the appropriate scheme.
        
        Returns:
            Tuple of:
            - SchemeInfo model
            - Eligible loan amount (capped by scheme max loan)
            - is_within_scheme_limit (bool)
            - status_message (str)
        """
        if project_cost <= MICRO_FINANCE_SCHEME["max_project_cost"]:
            scheme_dict = MICRO_FINANCE_SCHEME
            scheme_info = SchemeInfo(**scheme_dict)
            uncapped_loan = project_cost * AGENCY_LOAN_FRACTION
            eligible_loan = min(uncapped_loan, scheme_info.max_loan)
            return (
                scheme_info,
                eligible_loan,
                True,
                f"Your project cost of {format_inr(project_cost)} qualifies for the {scheme_info.name}."
            )

        elif project_cost <= TERM_LOAN_SCHEME["max_project_cost"]:
            scheme_dict = TERM_LOAN_SCHEME
            scheme_info = SchemeInfo(**scheme_dict)
            uncapped_loan = project_cost * AGENCY_LOAN_FRACTION
            eligible_loan = min(uncapped_loan, scheme_info.max_loan)
            return (
                scheme_info,
                eligible_loan,
                True,
                f"Your project cost of {format_inr(project_cost)} qualifies for the {scheme_info.name}."
            )

        else:
            # Outside scheme limits (> ₹50 Lakh)
            # Default to Term Loan parameters as baseline reference, but set is_within_scheme_limit=False
            base_dict = dict(TERM_LOAN_SCHEME)
            base_dict["name"] = OUTSIDE_SCHEME_RANGE_NAME
            scheme_info = SchemeInfo(**base_dict)
            # Max scheme loan cap of ₹45 Lakh applies for scheme reference
            eligible_loan = TERM_LOAN_SCHEME["max_loan"]
            return (
                scheme_info,
                eligible_loan,
                False,
                f"Project cost ({format_inr(project_cost)}) exceeds the maximum {format_inr(MAX_SCHEME_PROJECT_COST)} scheme limit."
            )
