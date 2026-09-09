"""
GramBiz Model 2 -- Feature Merging Pipeline
=============================================
Combines cleaned Census PCA, A-1 Villages, Udyam MSME, and ASI datasets
into data/processed/merged_dataset.csv.
"""

import logging
import os
from typing import Optional

import numpy as np
import pandas as pd

from src.config import PROCESSED_DATA_DIR
from src.data.cleaning import clean_a1_villages, clean_census_pca, clean_udyam_msme
from src.data.loaders import load_a1_villages, load_census_pca, load_udyam_msme
from src.geographic.normalization import _state_code_to_name, normalize_district_name, normalize_state_name

logger = logging.getLogger(__name__)


def build_merged_dataset(
    level: str = "SUB-DISTRICT",
    tru: str = "Rural",
    save: bool = True,
) -> pd.DataFrame:
    """
    Build geographically merged dataset.

    Returns
    -------
    pd.DataFrame
        Merged dataset with Census, Udyam MSME, and geography metadata.
    """
    logger.info("============================================================")
    logger.info("BUILDING MODEL 2 MERGED DATASET")
    logger.info("============================================================")

    # 1. Census PCA
    census_raw = load_census_pca(level=level, tru=tru)
    census = clean_census_pca(census_raw)

    # 2. A-1 Villages
    a1_raw = load_a1_villages(level=level, tru=tru)
    a1 = clean_a1_villages(a1_raw)

    # Merge Census PCA + A-1 Villages on geo_key
    a1_cols = [c for c in a1.columns if c not in census.columns or c == "geo_key"]
    merged = pd.merge(census, a1[a1_cols], on="geo_key", how="left")
    logger.info(f"Merged Census + A-1: {merged.shape}")

    # Add state_name and district_name metadata
    merged["state_name"] = merged["state_code"].map(_state_code_to_name)
    merged["district_name"] = merged["name"].apply(normalize_district_name)

    # 3. Udyam MSME Registration Data (District-level)
    try:
        udyam_raw = load_udyam_msme()
        udyam = clean_udyam_msme(udyam_raw)

        # Merge on state_name + district_name
        merged["state_lower"] = merged["state_name"].str.lower().str.strip()
        merged["dist_lower"] = merged["district_name"].str.lower().str.strip()

        udyam["state_lower"] = udyam["state_name"].str.lower().str.strip()
        udyam["dist_lower"] = udyam["district_name"].str.lower().str.strip()

        udyam_sub = udyam[["state_lower", "dist_lower", "micro", "small", "medium", "total"]].copy()
        udyam_sub = udyam_sub.rename(columns={
            "micro": "msme_micro_count",
            "small": "msme_small_count",
            "medium": "msme_medium_count",
            "total": "msme_total_count",
        })

        merged = pd.merge(merged, udyam_sub, on=["state_lower", "dist_lower"], how="left")
        merged = merged.drop(columns=["state_lower", "dist_lower"], errors="ignore")
        logger.info(f"Merged with Udyam MSME: {merged.shape}")

    except Exception as e:
        logger.warning(f"Failed to merge Udyam MSME data: {e}")

    if save:
        os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
        out_path = os.path.join(PROCESSED_DATA_DIR, "merged_dataset.csv")
        merged.to_csv(out_path, index=False)

        # Save geography master
        geo_cols = ["state_code", "state_name", "district_code", "district_name", "subdistrict_code", "name", "geo_key"]
        avail_geo = [c for c in geo_cols if c in merged.columns]
        geo_df = merged[avail_geo].drop_duplicates()
        geo_path = os.path.join(PROCESSED_DATA_DIR, "geography_master.csv")
        geo_df.to_csv(geo_path, index=False)

        logger.info(f"Saved merged dataset ({merged.shape}) to {out_path}")

    return merged
