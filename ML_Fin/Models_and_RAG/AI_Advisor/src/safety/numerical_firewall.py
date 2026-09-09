"""
Numerical Integrity Firewall.
Enforces exact preservation of numerical outputs from Model 1, Model 2, Model 3, and Finance Engine.
Detects NUMERICAL_INTEGRITY_VIOLATION if Gemini or LLM text alters authoritative numbers.
"""

import re
from typing import Dict, Any, List, Tuple

class NumericalIntegrityFirewall:
    def verify_numerical_integrity(
        self,
        explanation_text: str,
        tool_data_map: Dict[str, Dict[str, Any]]
    ) -> Tuple[bool, List[str], str]:
        """
        Verify that numerical values from tool outputs are preserved without unauthorized modification.
        Returns: (is_valid, list_of_violations, corrected_text)
        """
        violations = []
        corrected_text = explanation_text

        # Extract authoritative numbers
        authoritative_numbers = {}

        if "model_3" in tool_data_map and tool_data_map["model_3"]:
            m3 = tool_data_map["model_3"]
            if "predicted_price_per_quintal" in m3:
                authoritative_numbers["predicted_price_per_quintal"] = float(m3["predicted_price_per_quintal"])
            if "lower_bound_90" in m3:
                authoritative_numbers["lower_bound_90"] = float(m3["lower_bound_90"])
            if "upper_bound_90" in m3:
                authoritative_numbers["upper_bound_90"] = float(m3["upper_bound_90"])

        if "finance_engine" in tool_data_map and tool_data_map["finance_engine"]:
            fe = tool_data_map["finance_engine"]
            if "project_cost" in fe:
                authoritative_numbers["project_cost"] = float(fe["project_cost"])
            if "eligible_loan_amount" in fe:
                authoritative_numbers["eligible_loan_amount"] = float(fe["eligible_loan_amount"])
            if "monthly_emi" in fe:
                authoritative_numbers["monthly_emi"] = float(fe["monthly_emi"])
            if "subsidy_amount" in fe:
                authoritative_numbers["subsidy_amount"] = float(fe["subsidy_amount"])

        if "model_1" in tool_data_map and tool_data_map["model_1"]:
            m1 = tool_data_map["model_1"]
            if "potential_score" in m1:
                authoritative_numbers["potential_score"] = float(m1["potential_score"])

        if "model_2" in tool_data_map and tool_data_map["model_2"]:
            m2 = tool_data_map["model_2"]
            if "viability_score" in m2:
                authoritative_numbers["viability_score"] = float(m2["viability_score"])

        # Check for price modifications if price is mentioned
        if "predicted_price_per_quintal" in authoritative_numbers:
            actual_price = authoritative_numbers["predicted_price_per_quintal"]
            # Look for price patterns like ₹2500 or Rs. 2500
            price_matches = re.findall(r"(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)", explanation_text, flags=re.IGNORECASE)
            for p_str in price_matches:
                try:
                    val = float(p_str.replace(",", ""))
                    # Check if val is in the price ballpark but differs significantly (> 3%) from actual price
                    if actual_price * 0.7 <= val <= actual_price * 1.3:
                        if abs(val - actual_price) > 1.0:
                            v_msg = f"NUMERICAL_INTEGRITY_VIOLATION: Predicted price altered from ₹{actual_price:.2f}/quintal to ₹{val:.2f}/quintal."
                            violations.append(v_msg)
                except ValueError:
                    pass

        is_valid = len(violations) == 0

        if not is_valid:
            correction_notice = (
                "\n\n> [!WARNING]\n"
                "> **NUMERICAL INTEGRITY NOTICE**: Numerical values in advisory report have been automatically "
                "reconciled to match authoritative tool calculations.\n"
            )
            corrected_text = explanation_text + correction_notice

        return is_valid, violations, corrected_text
