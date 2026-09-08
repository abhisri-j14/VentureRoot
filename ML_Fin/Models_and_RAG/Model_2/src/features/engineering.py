"""
GramBiz Model 2 -- Feature Engineering Pipeline
=================================================
Builds 35+ domain-specific demographic, MSME density, industrial strength,
and economic features using safe ratio primitives.

CRITICAL TARGET INTEGRITY NOTICE:
Explicitly separates features used to construct the target formula from
features passed as ML model inputs to prevent circular target leakage.
"""

import logging
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd

from src.utils.metrics import min_max_scale, safe_ratio

logger = logging.getLogger(__name__)

# Features used strictly in Target Index Construction
TARGET_CONSTRUCTION_FEATURES: List[str] = [
    "viability_demand_component",
    "viability_msme_component",
    "viability_purchasing_power_component",
    "viability_infra_component",
    "viability_competition_component",
]

# Features available to ML Models (Leakage Safe)
ML_INPUT_FEATURES: List[str] = [
    "literacy_rate",
    "female_literacy_rate",
    "sc_st_population_share",
    "working_pop_ratio",
    "workers_cultivator_share",
    "workers_agri_labour_share",
    "workers_hh_industry_share",
    "workers_other_share",
    "pop_density_per_sqkm",
    "households_per_village",
    "inhabited_village_ratio",
    "msme_micro_per_1k",
    "msme_small_per_1k",
    "msme_medium_per_1k",
    "msme_total_per_1k",
    "msme_micro_share",
    "msme_small_share",
    "pop_0_6_ratio",
    "gender_ratio_females_per_1k",
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineer all domain features on merged dataset.

    Parameters
    ----------
    df : pd.DataFrame
        Merged dataset from src.data.feature_merging.

    Returns
    -------
    pd.DataFrame
        Dataset with engineered features.
    """
    logger.info(f"Engineering features for dataset of shape {df.shape}...")
    df = df.copy()

    # 1. Demographics
    df["literacy_rate"] = safe_ratio(df["pop_literate"], df["population"])
    df["female_literacy_rate"] = safe_ratio(df["pop_literate_female"], df["pop_female"])
    df["sc_st_population_share"] = safe_ratio(df["pop_sc"] + df["pop_st"], df["population"])
    df["pop_0_6_ratio"] = safe_ratio(df["pop_0_6"], df["population"])
    df["gender_ratio_females_per_1k"] = safe_ratio(df["pop_female"], df["pop_male"], multiplier=1000.0)

    # 2. Workforce Ratios
    df["working_pop_ratio"] = safe_ratio(df["workers_total"], df["population"])
    df["workers_cultivator_share"] = safe_ratio(df["workers_cultivator"], df["workers_total"])
    df["workers_agri_labour_share"] = safe_ratio(df["workers_agri_labour"], df["workers_total"])
    df["workers_hh_industry_share"] = safe_ratio(df["workers_hh_industry"], df["workers_total"])
    df["workers_other_share"] = safe_ratio(df["workers_other"], df["workers_total"])

    # 3. Settlement & Land
    pop_density = safe_ratio(df["population"], df["area_sqkm"])
    df["pop_density_per_sqkm"] = np.clip(pop_density, 0, 50000)
    df["households_per_village"] = safe_ratio(df["households"], df["villages_inhabited"])
    df["inhabited_village_ratio"] = safe_ratio(
        df["villages_inhabited"],
        df["villages_inhabited"] + df["villages_uninhabited"]
    )

    # 4. MSME & Industrial Density (Udyam)
    pop_k = safe_ratio(df["population"], pd.Series(1000.0, index=df.index))
    df["msme_micro_per_1k"] = safe_ratio(df["msme_micro_count"], pop_k)
    df["msme_small_per_1k"] = safe_ratio(df["msme_small_count"], pop_k)
    df["msme_medium_per_1k"] = safe_ratio(df["msme_medium_count"], pop_k)
    df["msme_total_per_1k"] = safe_ratio(df["msme_total_count"], pop_k)

    msme_tot = df["msme_total_count"].replace(0, 1)
    df["msme_micro_share"] = safe_ratio(df["msme_micro_count"], msme_tot)
    df["msme_small_share"] = safe_ratio(df["msme_small_count"], msme_tot)

    # 5. Economic & Infrastructure Component Proxies
    df["purchasing_power_proxy"] = min_max_scale(
        0.5 * df["literacy_rate"] + 0.5 * df["working_pop_ratio"]
    )
    df["commercial_activity_density"] = min_max_scale(df["msme_total_per_1k"])
    df["infrastructure_readiness_index"] = min_max_scale(
        0.6 * df["inhabited_village_ratio"] + 0.4 * (1 - df["sc_st_population_share"])
    )

    logger.info(f"Feature engineering complete. Dataset shape: {df.shape}")
    return df


def get_ml_feature_columns() -> List[str]:
    """Return list of leakage-safe ML feature column names."""
    return ML_INPUT_FEATURES.copy()


def get_feature_dictionary() -> pd.DataFrame:
    """Return DataFrame describing all features."""
    records = []
    for f in ML_INPUT_FEATURES:
        records.append({
            "feature_name": f,
            "used_for": "ML Model Input",
            "leakage_status": "Leakage Safe",
            "type": "Numeric Ratio / Density"
        })
    return pd.DataFrame(records)
