"""
GramBiz Model 1 -- Feature Engineering
========================================
Derive modeling features from the merged Census + HCES + CPI dataset.

All features are derived from observable data.
Division-by-zero is handled with np.where guards.
No fabricated values.
"""

import logging
from typing import List, Optional

import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def safe_ratio(numerator: pd.Series, denominator: pd.Series) -> pd.Series:
    """Compute ratio with division-by-zero protection."""
    return np.where(denominator > 0, numerator / denominator, np.nan)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineer all modeling features from the merged dataset.

    Feature groups:
    1. Demographic features
    2. Workforce features
    3. Settlement/geographic features
    4. Economic features (state-level enrichment)

    Parameters
    ----------
    df : pd.DataFrame
        Merged dataset from feature_merging.build_merged_dataset()

    Returns
    -------
    pd.DataFrame
        Dataset with engineered feature columns added.
    """
    logger.info("Engineering features...")
    df = df.copy()

    # ================================================================
    # 1. DEMOGRAPHIC FEATURES
    # ================================================================
    logger.info("  [1/4] Demographic features...")

    df["household_size"] = safe_ratio(df["population"], df["households"])
    df["literacy_rate"] = safe_ratio(df["pop_literate"], df["population"])
    df["female_ratio"] = safe_ratio(df["pop_female"], df["population"])
    df["child_ratio"] = safe_ratio(df["pop_0_6"], df["population"])
    df["sc_ratio"] = safe_ratio(df["pop_sc"], df["population"])
    df["st_ratio"] = safe_ratio(df["pop_st"], df["population"])

    # Log-transformed population (reduces skewness)
    df["log_population"] = np.log1p(df["population"])
    df["log_households"] = np.log1p(df["households"])

    # ================================================================
    # 2. WORKFORCE FEATURES
    # ================================================================
    logger.info("  [2/4] Workforce features...")

    df["worker_participation_rate"] = safe_ratio(df["workers_total"], df["population"])
    df["main_worker_ratio"] = safe_ratio(df["workers_main"], df["population"])
    df["marginal_worker_ratio"] = safe_ratio(df["workers_marginal"], df["population"])
    df["cultivator_ratio"] = safe_ratio(df["workers_cultivator"], df["population"])
    df["agricultural_labour_ratio"] = safe_ratio(df["workers_agri_labour"], df["population"])
    df["hh_industry_ratio"] = safe_ratio(df["workers_hh_industry"], df["population"])
    df["other_worker_ratio"] = safe_ratio(df["workers_other"], df["population"])
    df["non_worker_ratio"] = safe_ratio(df["non_workers"], df["population"])

    # Agricultural workforce combined
    df["agri_workforce_ratio"] = safe_ratio(
        df["workers_cultivator"] + df["workers_agri_labour"],
        df["population"]
    )

    # Non-agricultural workforce
    df["non_agri_worker_ratio"] = safe_ratio(
        df["workers_hh_industry"] + df["workers_other"],
        df["population"]
    )

    # ================================================================
    # 3. SETTLEMENT / GEOGRAPHIC FEATURES
    # ================================================================
    logger.info("  [3/4] Settlement features...")

    if "area_sqkm" in df.columns:
        df["population_density"] = safe_ratio(df["population"], df["area_sqkm"])
        df["household_density"] = safe_ratio(df["households"], df["area_sqkm"])
        df["log_area"] = np.log1p(df["area_sqkm"])

    if "villages_inhabited" in df.columns:
        df["settlement_density"] = safe_ratio(
            df["villages_inhabited"], df["area_sqkm"]
        )
        df["avg_village_population"] = safe_ratio(
            df["population"], df["villages_inhabited"]
        )
        df["avg_village_households"] = safe_ratio(
            df["households"], df["villages_inhabited"]
        )

    # ================================================================
    # 4. ECONOMIC FEATURES (state-level enrichment)
    # ================================================================
    logger.info("  [4/4] Economic features...")

    # MPCE features are already merged at state level
    # Log-transform MPCE for modeling
    if "mpce_rural" in df.columns:
        df["log_mpce_rural"] = np.log1p(df["mpce_rural"])

    if "mpce_urban" in df.columns and "mpce_rural" in df.columns:
        df["mpce_rural_urban_ratio"] = safe_ratio(
            df["mpce_rural"], df["mpce_urban"]
        )

    logger.info(f"Feature engineering complete: {df.shape}")
    return df


def get_feature_columns() -> List[str]:
    """
    Return the list of feature columns used for modeling.

    This is the canonical feature set. Any model must use these
    (or a subset of these) for training and prediction.
    """
    return [
        # Demographic
        "population", "households", "household_size",
        "log_population", "log_households",
        "literacy_rate", "female_ratio", "child_ratio",
        "sc_ratio", "st_ratio",
        # Workforce
        "worker_participation_rate", "main_worker_ratio", "marginal_worker_ratio",
        "cultivator_ratio", "agricultural_labour_ratio",
        "hh_industry_ratio", "other_worker_ratio", "non_worker_ratio",
        "agri_workforce_ratio", "non_agri_worker_ratio",
        # Settlement
        "population_density", "household_density",
        "log_area", "settlement_density",
        "avg_village_population", "avg_village_households",
        # Economic (state-level enrichment)
        "mpce_rural", "log_mpce_rural",
        "cpi_rural", "inflation_rural",
    ]


def get_feature_dictionary() -> pd.DataFrame:
    """Generate the feature dictionary with provenance information."""
    entries = [
        ("population", "Census 2011", "TOT_P", "direct", "count", "sub-district", "2011", "Total population"),
        ("households", "Census 2011", "No_HH", "direct", "count", "sub-district", "2011", "Total households"),
        ("household_size", "Census 2011", "TOT_P / No_HH", "derived ratio", "ratio", "sub-district", "2011", "Average persons per household"),
        ("log_population", "Census 2011", "log1p(TOT_P)", "log transform", "log-count", "sub-district", "2011", "Log-transformed population"),
        ("log_households", "Census 2011", "log1p(No_HH)", "log transform", "log-count", "sub-district", "2011", "Log-transformed households"),
        ("literacy_rate", "Census 2011", "P_LIT / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Proportion of literate population"),
        ("female_ratio", "Census 2011", "TOT_F / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Proportion female"),
        ("child_ratio", "Census 2011", "P_06 / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Proportion aged 0-6"),
        ("sc_ratio", "Census 2011", "P_SC / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Proportion Scheduled Caste"),
        ("st_ratio", "Census 2011", "P_ST / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Proportion Scheduled Tribe"),
        ("worker_participation_rate", "Census 2011", "TOT_WORK_P / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Worker participation rate"),
        ("main_worker_ratio", "Census 2011", "MAINWORK_P / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Main workers per capita"),
        ("marginal_worker_ratio", "Census 2011", "MARGWORK_P / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Marginal workers per capita"),
        ("cultivator_ratio", "Census 2011", "MAIN_CL_P / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Cultivators per capita"),
        ("agricultural_labour_ratio", "Census 2011", "MAIN_AL_P / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Agricultural labourers per capita"),
        ("hh_industry_ratio", "Census 2011", "MAIN_HH_P / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Household industry workers per capita"),
        ("other_worker_ratio", "Census 2011", "MAIN_OT_P / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Other workers per capita"),
        ("non_worker_ratio", "Census 2011", "NON_WORK_P / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Non-workers per capita"),
        ("agri_workforce_ratio", "Census 2011", "(CL + AL) / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Combined agricultural workforce ratio"),
        ("non_agri_worker_ratio", "Census 2011", "(HH + OT) / TOT_P", "derived ratio", "proportion", "sub-district", "2011", "Non-agricultural worker ratio"),
        ("population_density", "Census 2011 + A-1", "TOT_P / area_sqkm", "derived ratio", "persons/sqkm", "sub-district", "2011", "Population density"),
        ("household_density", "Census 2011 + A-1", "No_HH / area_sqkm", "derived ratio", "hh/sqkm", "sub-district", "2011", "Household density"),
        ("log_area", "A-1", "log1p(area_sqkm)", "log transform", "log-sqkm", "sub-district", "2011", "Log-transformed area"),
        ("settlement_density", "A-1", "villages_inhabited / area_sqkm", "derived ratio", "villages/sqkm", "sub-district", "2011", "Village density per area"),
        ("avg_village_population", "Census 2011 + A-1", "TOT_P / villages_inhabited", "derived ratio", "persons/village", "sub-district", "2011", "Average population per village"),
        ("avg_village_households", "Census 2011 + A-1", "No_HH / villages_inhabited", "derived ratio", "hh/village", "sub-district", "2011", "Average households per village"),
        ("mpce_rural", "HCES 2023-24", "direct (state-level)", "hierarchical mapping", "Rs./month", "state", "2023-24", "Monthly per capita consumption expenditure (Rural)"),
        ("log_mpce_rural", "HCES 2023-24", "log1p(mpce_rural)", "log transform", "log-Rs.", "state", "2023-24", "Log-transformed rural MPCE"),
        ("cpi_rural", "CPI July 2026", "direct (state-level)", "hierarchical mapping", "index", "state", "July 2026", "Consumer Price Index (Rural)"),
        ("inflation_rural", "CPI July 2026", "direct (state-level)", "hierarchical mapping", "percent", "state", "July 2026", "Rural inflation rate"),
    ]
    return pd.DataFrame(entries, columns=[
        "feature_name", "source_dataset", "source_column", "transformation",
        "unit", "geographic_level", "year", "description",
    ])
