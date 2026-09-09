"""
GramBiz Model 2 -- Hyper-Local Business Category Opportunity & Ranking Engine
================================================================================
Ranks 15 canonical GramBiz business categories for any given sub-district / location.
Computes category-specific competition, demand proxy, risk score, positive/negative drivers,
and explicit data availability indicators.

Categories Evaluated:
1. Dairy
2. Retail
3. Textiles
4. Food Processing
5. Agriculture
6. Fisheries
7. Poultry
8. Handicrafts
9. Manufacturing
10. Services
11. Repair/Maintenance
12. Transport
13. Hospitality
14. Personal Services
15. Other
"""

import logging
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from src.config import CANONICAL_CATEGORIES

logger = logging.getLogger(__name__)

# Category-specific multiplier parameters (Affinity to rural demographics)
CATEGORY_AFFINITY_WEIGHTS = {
    "Dairy": {"agri_affinity": 0.85, "literacy_req": 0.30, "urban_affinity": 0.20, "base_multiplier": 1.10},
    "Retail": {"agri_affinity": 0.50, "literacy_req": 0.50, "urban_affinity": 0.60, "base_multiplier": 1.05},
    "Textiles": {"agri_affinity": 0.40, "literacy_req": 0.45, "urban_affinity": 0.50, "base_multiplier": 1.00},
    "Food Processing": {"agri_affinity": 0.90, "literacy_req": 0.40, "urban_affinity": 0.30, "base_multiplier": 1.15},
    "Agriculture": {"agri_affinity": 0.95, "literacy_req": 0.25, "urban_affinity": 0.10, "base_multiplier": 1.20},
    "Fisheries": {"agri_affinity": 0.60, "literacy_req": 0.30, "urban_affinity": 0.20, "base_multiplier": 0.95},
    "Poultry": {"agri_affinity": 0.80, "literacy_req": 0.30, "urban_affinity": 0.25, "base_multiplier": 1.05},
    "Handicrafts": {"agri_affinity": 0.30, "literacy_req": 0.40, "urban_affinity": 0.40, "base_multiplier": 0.90},
    "Manufacturing": {"agri_affinity": 0.35, "literacy_req": 0.60, "urban_affinity": 0.70, "base_multiplier": 0.95},
    "Services": {"agri_affinity": 0.30, "literacy_req": 0.70, "urban_affinity": 0.75, "base_multiplier": 1.00},
    "Repair/Maintenance": {"agri_affinity": 0.50, "literacy_req": 0.50, "urban_affinity": 0.40, "base_multiplier": 1.05},
    "Transport": {"agri_affinity": 0.45, "literacy_req": 0.50, "urban_affinity": 0.60, "base_multiplier": 1.00},
    "Hospitality": {"agri_affinity": 0.20, "literacy_req": 0.65, "urban_affinity": 0.80, "base_multiplier": 0.85},
    "Personal Services": {"agri_affinity": 0.40, "literacy_req": 0.55, "urban_affinity": 0.50, "base_multiplier": 0.95},
    "Other": {"agri_affinity": 0.50, "literacy_req": 0.50, "urban_affinity": 0.50, "base_multiplier": 0.80}
}


def rank_business_categories(
    location_features: Dict[str, Any],
    overall_viability_score: float,
    msme_category_counts: Optional[Dict[str, int]] = None
) -> List[Dict[str, Any]]:
    """
    Rank all 15 GramBiz business categories for a specific location.

    Parameters
    ----------
    location_features : dict
        Engineered feature dictionary for the target sub-district/location.
    overall_viability_score : float
        Base location viability score predicted by model (0-100).
    msme_category_counts : dict, optional
        Optional observed establishment counts by category.

    Returns
    -------
    list of dict
        Ranked list of categories with detailed metrics, drivers, and warnings.
    """
    agri_rate = location_features.get("agricultural_worker_rate", 0.50)
    literacy_rate = location_features.get("literacy_rate", 0.60)
    work_rate = location_features.get("main_work_rate", 0.35)
    msme_density = location_features.get("msme_density_per_10k_pop", 10.0)
    factory_density = location_features.get("factory_density_per_100k_pop", 5.0)

    category_results = []

    for cat in CANONICAL_CATEGORIES:
        weights = CATEGORY_AFFINITY_WEIGHTS.get(cat, CATEGORY_AFFINITY_WEIGHTS["Other"])

        # Demand alignment score (0-100)
        demand_score = (
            (agri_rate * weights["agri_affinity"] * 40.0) +
            (literacy_rate * weights["literacy_req"] * 30.0) +
            (work_rate * 30.0)
        ) * weights["base_multiplier"]
        demand_score = float(np.clip(demand_score, 0.0, 100.0))

        # Competition assessment
        cat_msme_count = None
        has_cat_competition = False

        if msme_category_counts and cat in msme_category_counts:
            cat_msme_count = msme_category_counts[cat]
            has_cat_competition = True
            # Normalize count to 0-100 pressure scale
            competition_score = float(np.clip(cat_msme_count * 2.5, 5.0, 95.0))
        else:
            # Proxy competition from overall MSME density
            competition_score = float(np.clip(msme_density * 1.8, 10.0, 90.0))

        # Risk score calculation
        risk_components = []
        if competition_score > 70.0:
            risk_components.append("High existing category/MSME competition pressure")
        if literacy_rate < 0.50 and weights["literacy_req"] > 0.50:
            risk_components.append("Below-average local literacy for required skill profile")
        if agri_rate > 0.75 and cat not in ["Agriculture", "Dairy", "Food Processing"]:
            risk_components.append("High agrarian economy dependence may limit off-farm demand")

        risk_score = float(np.clip((competition_score * 0.4) + ((1.0 - literacy_rate) * 30.0) + (100.0 - overall_viability_score) * 0.3, 0.0, 100.0))

        # Overall Category Opportunity Score
        opportunity_score = (
            (overall_viability_score * 0.45) +
            (demand_score * 0.35) +
            ((100.0 - competition_score) * 0.20)
        )
        opportunity_score = float(np.clip(opportunity_score, 0.0, 100.0))

        # Positive Drivers
        positive_factors = []
        if agri_rate > 0.50 and weights["agri_affinity"] > 0.60:
            positive_factors.append("Strong local agricultural base supports supply chain & raw materials")
        if literacy_rate >= 0.65:
            positive_factors.append("High local literacy rate enhances adoption of new services/technologies")
        if competition_score < 40.0:
            positive_factors.append("Moderate to low existing competition density in area")
        if overall_viability_score > 60.0:
            positive_factors.append("Favorable overall sub-district economic & demographic infrastructure")
        if not positive_factors:
            positive_factors.append("Basic local population base supports entry-level operational scale")

        # Warnings / Limitations
        warnings = []
        if not has_cat_competition:
            warnings.append("Category-specific competitor counts unavailable; using overall MSME density proxy.")

        category_results.append({
            "category": cat,
            "opportunity_score": round(opportunity_score, 2),
            "demand_proxy_score": round(demand_score, 2),
            "competition_score": round(competition_score, 2),
            "risk_score": round(risk_score, 2),
            "category_specific_competition_available": has_cat_competition,
            "observed_competitor_count": cat_msme_count,
            "positive_factors": positive_factors,
            "risk_factors": risk_components if risk_components else ["Standard operational market risk"],
            "data_warnings": warnings
        })

    # Sort by opportunity score descending
    category_results.sort(key=lambda x: x["opportunity_score"], reverse=True)

    # Assign rank 1 to 15
    for rank, item in enumerate(category_results, 1):
        item["rank"] = rank

    return category_results
