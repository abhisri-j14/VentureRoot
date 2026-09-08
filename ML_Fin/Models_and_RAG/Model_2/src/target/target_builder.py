"""
GramBiz Model 2 -- Business Viability & Opportunity Score Target Builder
==========================================================================
Constructs a transparent, mathematically sound composite score (0.0 to 100.0)
measuring local business opportunity and viability.

Includes sensitivity analysis (weight perturbations) and ablation testing.
"""

import logging
import os
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from scipy import stats as sp_stats

from src.config import CANONICAL_CATEGORIES, EXTERNAL_DATA_DIR
from src.utils.metrics import min_max_scale

logger = logging.getLogger(__name__)

# Base Component Weights
BASE_TARGET_WEIGHTS: Dict[str, float] = {
    "demand_proxy": 0.30,
    "msme_density": 0.25,
    "purchasing_power_proxy": 0.25,
    "infrastructure_readiness": 0.20,
}

# Category Reweighting Multipliers (\alpha_c)
CATEGORY_MULTIPLIERS: Dict[str, float] = {
    "Dairy": 1.05,
    "Retail": 1.02,
    "Textiles": 0.98,
    "Food Processing": 1.08,
    "Agriculture": 1.04,
    "Fisheries": 1.00,
    "Poultry": 1.00,
    "Handicrafts": 0.96,
    "Manufacturing": 1.05,
    "Services": 1.02,
    "Repair/Maintenance": 1.06,
    "Transport": 1.02,
    "Hospitality": 1.03,
    "Personal Services": 1.01,
    "Other": 1.00,
}


def build_viability_score(
    df: pd.DataFrame,
    category: str = "Other",
    weights: Optional[Dict[str, float]] = None,
) -> pd.DataFrame:
    """
    Construct Business Opportunity & Viability Score (0-100).

    Parameters
    ----------
    df : pd.DataFrame
        Dataset with engineered features.
    category : str
        Canonical business category name.
    weights : Dict[str, float], optional
        Custom component weights.

    Returns
    -------
    pd.DataFrame
        DataFrame with 'viability_score' column and component sub-scores.
    """
    logger.info(f"Building Viability Score for category '{category}'...")
    df = df.copy()
    w = weights or BASE_TARGET_WEIGHTS

    # 1. Demand Proxy Component
    demand = min_max_scale(0.5 * df["working_pop_ratio"] + 0.5 * df["pop_density_per_sqkm"])
    df["viability_demand_component"] = demand

    # 2. MSME Density Component
    msme_comp = min_max_scale(df["msme_total_per_1k"])
    df["viability_msme_component"] = msme_comp

    # 3. Purchasing Power Proxy Component
    pp_comp = min_max_scale(df["purchasing_power_proxy"])
    df["viability_purchasing_power_component"] = pp_comp

    # 4. Infrastructure Readiness Component
    infra_comp = min_max_scale(df["infrastructure_readiness_index"])
    df["viability_infra_component"] = infra_comp

    # Composite Raw Index
    raw_score = (
        w.get("demand_proxy", 0.30) * demand
        + w.get("msme_density", 0.25) * msme_comp
        + w.get("purchasing_power_proxy", 0.25) * pp_comp
        + w.get("infrastructure_readiness", 0.20) * infra_comp
    )

    # Category Multiplier (\alpha_c)
    alpha_c = CATEGORY_MULTIPLIERS.get(category, 1.00)
    viability_score = np.clip(raw_score * alpha_c, 0.0, 100.0)
    df["viability_score"] = viability_score

    # Viability Tier Classification
    conditions = [
        viability_score >= 80.0,
        (viability_score >= 60.0) & (viability_score < 80.0),
        (viability_score >= 40.0) & (viability_score < 60.0),
        (viability_score >= 20.0) & (viability_score < 40.0),
        viability_score < 20.0,
    ]
    choices = ["Very High", "High", "Moderate", "Low", "Very Low"]
    df["viability_level"] = np.select(conditions, choices, default="Moderate")

    logger.info(f"Viability score built. Range: [{viability_score.min():.2f}, {viability_score.max():.2f}]")
    return df


def sensitivity_analysis(df: pd.DataFrame, category: str = "Other", delta: float = 0.05) -> pd.DataFrame:
    """Run weight sensitivity analysis with +/- delta perturbations."""
    logger.info(f"Running sensitivity analysis (delta={delta})...")
    base_df = build_viability_score(df, category=category)
    base_score = base_df["viability_score"]

    records = []
    components = list(BASE_TARGET_WEIGHTS.keys())

    for comp in components:
        for sign in [-1, 1]:
            perturbed_w = BASE_TARGET_WEIGHTS.copy()
            perturbed_w[comp] += sign * delta
            # Normalize
            tot = sum(perturbed_w.values())
            perturbed_w = {k: v / tot for k, v in perturbed_w.items()}

            p_df = build_viability_score(df, category=category, weights=perturbed_w)
            p_score = p_df["viability_score"]

            spearman, _ = sp_stats.spearmanr(base_score, p_score)
            mae_diff = np.mean(np.abs(base_score - p_score))

            records.append({
                "component": comp,
                "direction": "+5%" if sign == 1 else "-5%",
                "spearman_rank_correlation": round(spearman, 4),
                "mean_abs_score_change": round(mae_diff, 4)
            })

    return pd.DataFrame(records)


def ablation_analysis(df: pd.DataFrame, category: str = "Other") -> pd.DataFrame:
    """Run ablation analysis evaluating ranking impact when components are dropped."""
    logger.info("Running target component ablation analysis...")
    base_df = build_viability_score(df, category=category)
    base_score = base_df["viability_score"]

    records = []
    components = list(BASE_TARGET_WEIGHTS.keys())

    for comp in components:
        ablated_w = BASE_TARGET_WEIGHTS.copy()
        ablated_w[comp] = 0.0
        tot = sum(ablated_w.values())
        ablated_w = {k: v / tot for k, v in ablated_w.items()}

        a_df = build_viability_score(df, category=category, weights=ablated_w)
        a_score = a_df["viability_score"]

        spearman, _ = sp_stats.spearmanr(base_score, a_score)
        mae_diff = np.mean(np.abs(base_score - a_score))

        records.append({
            "dropped_component": comp,
            "spearman_rank_correlation": round(spearman, 4),
            "spearman_drop": round(1.0 - spearman, 4),
            "mean_abs_score_change": round(mae_diff, 4)
        })

    return pd.DataFrame(records)
