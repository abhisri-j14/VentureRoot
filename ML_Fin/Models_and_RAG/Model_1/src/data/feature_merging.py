"""
GramBiz Model 1 -- Feature Merging Pipeline
=============================================
Merge Census PCA + A-1 + HCES + CPI into a single analysis-ready dataset.

Geographic hierarchy:
    Census PCA (sub-district, 94 cols)
        + A-1 (area, villages, density) via geo_key
        + HCES (state-level MPCE) via state_code  [documented hierarchical mapping]
        + CPI (state-level inflation) via state_code  [documented hierarchical mapping]
"""

import logging
import os
from typing import Optional

import pandas as pd
import numpy as np

from src.data.loaders import (
    load_census_pca, load_a1_villages, load_hces_mpce, load_cpi_state,
)
from src.data.cleaning import (
    clean_census_pca, clean_a1_villages, clean_hces_mpce, clean_cpi_state,
)
from src.data.geographic_normalization import (
    normalize_state_name, _state_code_to_name,
)
from src.data.validation import validate_merge_coverage

logger = logging.getLogger(__name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def build_merged_dataset(
    level: str = "SUB-DISTRICT",
    tru: str = "Rural",
    save: bool = True,
) -> pd.DataFrame:
    """
    Build the complete merged dataset for modeling.

    Steps:
    1. Load and clean Census PCA (sub-district, Rural)
    2. Load and clean A-1 (sub-district, Total) for area/village counts
    3. Load and clean HCES MPCE (state-level)
    4. Load and clean CPI (state-level)
    5. Merge all on geographic keys

    Parameters
    ----------
    level : str
        Geographic level to filter Census PCA to.
    tru : str
        Total/Rural/Urban filter for Census PCA.
    save : bool
        If True, save to data/processed/merged_dataset.csv.

    Returns
    -------
    pd.DataFrame
        Merged dataset ready for feature engineering.
    """
    logger.info("=" * 60)
    logger.info("BUILDING MERGED DATASET")
    logger.info("=" * 60)

    # ── 1. Census PCA ──────────────────────────────────────────
    logger.info("[1/4] Loading Census PCA...")
    census_raw = load_census_pca(level=level, tru=tru, use_full=True)
    census = clean_census_pca(census_raw)
    logger.info(f"  Census PCA: {census.shape}")

    # ── 2. A-1 Villages (for area and village counts) ──────────
    logger.info("[2/4] Loading A-1 Villages...")
    a1_raw = load_a1_villages(level=level, tru="Total")
    a1 = clean_a1_villages(a1_raw)

    # Select only A-1 columns we need (avoid column name collisions)
    a1_cols = [
        "geo_key", "villages_inhabited", "villages_uninhabited",
        "num_towns", "area_sqkm",
    ]
    a1_subset = a1[a1_cols].copy()

    # Remove duplicates in A-1 (keep first)
    a1_subset = a1_subset.drop_duplicates(subset=["geo_key"], keep="first")

    # Validate merge coverage
    coverage = validate_merge_coverage(
        census, a1_subset, on="geo_key",
        left_name="Census PCA", right_name="A-1"
    )
    logger.info(f"  Census-A1 merge coverage: {coverage['coverage_pct']}%")

    # Merge Census + A-1
    merged = census.merge(a1_subset, on="geo_key", how="left")
    logger.info(f"  After Census+A-1 merge: {merged.shape}")

    # ── 3. HCES MPCE (state-level) ─────────────────────────────
    logger.info("[3/4] Loading HCES MPCE (state-level)...")
    hces_raw = load_hces_mpce()
    hces = clean_hces_mpce(hces_raw)

    # Filter to Rural sector
    hces_rural = hces[hces["Sector"] == "Rural"][["state_name", "mpce"]].copy()
    hces_rural = hces_rural.rename(columns={"mpce": "mpce_rural"})

    # Also get urban MPCE for reference
    hces_urban = hces[hces["Sector"] == "Urban"][["state_name", "mpce"]].copy()
    hces_urban = hces_urban.rename(columns={"mpce": "mpce_urban"})

    # Add state_name to merged dataset for HCES join
    merged["state_name"] = merged["state_code"].apply(_state_code_to_name)

    # Normalize HCES state names
    hces_rural["state_name"] = hces_rural["state_name"].apply(
        lambda x: normalize_state_name(x, source="hces")
    )
    hces_urban["state_name"] = hces_urban["state_name"].apply(
        lambda x: normalize_state_name(x, source="hces")
    )

    coverage_hces = validate_merge_coverage(
        merged, hces_rural, on="state_name",
        left_name="Merged", right_name="HCES Rural"
    )
    logger.info(f"  HCES merge coverage: {coverage_hces['coverage_pct']}%")

    merged = merged.merge(hces_rural, on="state_name", how="left")
    merged = merged.merge(hces_urban, on="state_name", how="left")
    logger.info(f"  After HCES merge: {merged.shape}")

    # ── 4. CPI (state-level) ──────────────────────────────────
    logger.info("[4/4] Loading CPI State...")
    cpi_raw = load_cpi_state()
    cpi = clean_cpi_state(cpi_raw)

    # Normalize CPI state names
    cpi["state_name"] = cpi["state"].apply(
        lambda x: normalize_state_name(x, source="cpi")
    )
    cpi_cols = ["state_name", "cpi_rural", "cpi_urban", "inflation_rural", "inflation_urban"]
    cpi_subset = cpi[cpi_cols].copy()

    coverage_cpi = validate_merge_coverage(
        merged, cpi_subset, on="state_name",
        left_name="Merged", right_name="CPI"
    )
    logger.info(f"  CPI merge coverage: {coverage_cpi['coverage_pct']}%")

    merged = merged.merge(cpi_subset, on="state_name", how="left")
    logger.info(f"  After CPI merge: {merged.shape}")

    # ── Add data provenance metadata columns ──────────────────
    merged["census_year"] = 2011
    merged["hces_year"] = "2023-24"
    merged["cpi_year"] = "July 2026"
    merged["geographic_level"] = level
    merged["tru_filter"] = tru

    # ── Save ──────────────────────────────────────────────────
    if save:
        out_path = os.path.join(BASE_DIR, "data", "processed", "merged_dataset.csv")
        merged.to_csv(out_path, index=False)
        logger.info(f"  Saved: {out_path}")

    logger.info(f"MERGED DATASET: {merged.shape}")
    logger.info("=" * 60)
    return merged
