"""
GramBiz Model 3 — Out-of-Distribution (OOD) & Cold-Start Detector
===================================================================
Detects unseen locations, commodities, varieties, numerical outliers,
calculates data completeness, and evaluates prediction abstention triggers.
"""

from typing import Dict, Any, List, Optional
import pandas as pd


class OODDetector:
    def __init__(self, known_states: List[str] = None, known_districts: List[str] = None, known_markets: List[str] = None, known_commodities: List[str] = None):
        self.known_states = set(known_states or [])
        self.known_districts = set(known_districts or [])
        self.known_markets = set(known_markets or [])
        self.known_commodities = set(known_commodities or [])

    def check_ood(
        self,
        state: str,
        district: str,
        market: str,
        commodity: str,
        recent_observed_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """Checks structured OOD criteria and returns data completeness score."""
        reasons = []
        warnings = []
        completeness_score = 1.0

        state_found = state in self.known_states if self.known_states else True
        district_found = district in self.known_districts if self.known_districts else True
        market_found = market in self.known_markets if self.known_markets else True
        commodity_found = commodity in self.known_commodities if self.known_commodities else True

        extreme_input_detected = False
        if recent_observed_price is not None:
            if recent_observed_price <= 0 or recent_observed_price > 100000:
                extreme_input_detected = True
                reasons.append(f"Extreme or invalid input price: ₹{recent_observed_price}")
                warnings.append(f"Reported input price ₹{recent_observed_price} is out of realistic agricultural price bounds.")
                completeness_score -= 0.30

        if not state_found:
            reasons.append(f"Unseen state: {state}")
            warnings.append(f"State '{state}' was not observed during model training.")
            completeness_score -= 0.25

        if not district_found:
            reasons.append(f"Unseen district: {district}")
            warnings.append(f"District '{district}' was not observed during model training.")
            completeness_score -= 0.25

        if not market_found:
            reasons.append(f"Unseen APMC market: {market}")
            warnings.append(f"Market '{market}' unseen in historical APMC records. Falling back to district/state averages.")
            completeness_score -= 0.20

        if not commodity_found:
            reasons.append(f"Unseen commodity: {commodity}")
            warnings.append(f"Commodity '{commodity}' was not observed in training data.")
            completeness_score -= 0.30

        is_ood = len(reasons) > 0
        severity = "HIGH" if (not commodity_found or not state_found or extreme_input_detected) else ("MEDIUM" if not market_found else "NONE")

        historical_data_avail = market_found and commodity_found and (recent_observed_price is None or recent_observed_price > 0)

        return {
            "is_out_of_distribution": is_ood,
            "severity": severity,
            "reasons": reasons,
            "warnings": warnings,
            "data_completeness": max(0.0, round(completeness_score, 2)),
            "location_found": state_found and district_found,
            "market_found": market_found,
            "commodity_found": commodity_found,
            "historical_data_available": historical_data_avail,
            "extreme_input_detected": extreme_input_detected
        }
