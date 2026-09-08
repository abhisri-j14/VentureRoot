"""
GramBiz Model 2 -- Data Cleaning Pipeline
==========================================
Reproducible cleaning for Census PCA, A-1 Villages, Udyam MSME, and ASI datasets.
Rules:
- Standardize geographic codes (zfill 2/3/5 digits)
- Clean text whitespace and formatting
- Convert numeric strings with commas to floats
- Never modify raw files; generate cleaned output
"""

import logging
import re
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def clean_census_pca(df: pd.DataFrame) -> pd.DataFrame:
    """Clean Census PCA DataFrame."""
    logger.info(f"Cleaning Census PCA: {df.shape}")
    df = df.copy()

    rename_map = {
        "State": "state_code",
        "District": "district_code",
        "Subdistt": "subdistrict_code",
        "Town/Village": "town_village_code",
        "Ward": "ward_code",
        "EB": "eb_code",
        "Level": "level",
        "Name": "name",
        "TRU": "tru",
        "No_HH": "households",
        "TOT_P": "population",
        "TOT_M": "pop_male",
        "TOT_F": "pop_female",
        "P_06": "pop_0_6",
        "P_SC": "pop_sc",
        "P_ST": "pop_st",
        "P_LIT": "pop_literate",
        "M_LIT": "pop_literate_male",
        "F_LIT": "pop_literate_female",
        "TOT_WORK_P": "workers_total",
        "MAINWORK_P": "workers_main",
        "MAIN_CL_P": "workers_cultivator",
        "MAIN_AL_P": "workers_agri_labour",
        "MAIN_HH_P": "workers_hh_industry",
        "MAIN_OT_P": "workers_other",
        "MARGWORK_P": "workers_marginal",
        "NON_WORK_P": "non_workers",
    }
    existing_renames = {k: v for k, v in rename_map.items() if k in df.columns}
    df = df.rename(columns=existing_renames)

    remaining = {c: c.lower() for c in df.columns if c not in existing_renames.values()}
    df = df.rename(columns=remaining)

    df["name"] = df["name"].astype(str).str.strip()

    # Code zfill
    df["state_code"] = df["state_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(2)
    df["district_code"] = df["district_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(3)
    df["subdistrict_code"] = df["subdistrict_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(5)

    df["geo_key"] = (
        df["state_code"] + "|"
        + df["district_code"] + "|"
        + df["subdistrict_code"]
    )

    numeric_cols = [c for c in df.columns if c not in [
        "state_code", "district_code", "subdistrict_code",
        "town_village_code", "ward_code", "eb_code",
        "level", "name", "tru", "geo_key"
    ]]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["is_uninhabited"] = df["population"] == 0
    df = df[df["level"] != "India"].copy()

    logger.info(f"Cleaned Census PCA: {df.shape}")
    return df


def clean_a1_villages(df: pd.DataFrame) -> pd.DataFrame:
    """Clean A-1 Villages DataFrame."""
    logger.info(f"Cleaning A-1 Villages: {df.shape}")
    df = df.copy()

    df["name"] = df["name"].astype(str).str.replace(r"[@$*#&]+", "", regex=True).str.strip()

    df["state_code"] = df["state_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(2)
    df["district_code"] = df["district_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(3)
    df["subdistrict_code"] = df["subdistrict_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(5)

    df["geo_key"] = (
        df["state_code"] + "|"
        + df["district_code"] + "|"
        + df["subdistrict_code"]
    )

    numeric_cols = ["villages_inhabited", "villages_uninhabited", "num_towns", "num_households", "pop_persons", "area_sqkm", "pop_density"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df.loc[df["area_sqkm"] <= 0, "area_sqkm"] = np.nan
    logger.info(f"Cleaned A-1: {df.shape}")
    return df


def clean_udyam_msme(df: pd.DataFrame) -> pd.DataFrame:
    """Clean Udyam MSME Registration DataFrame."""
    logger.info(f"Cleaning Udyam MSME: {df.shape}")
    df = df.copy()

    df["state_name"] = df["state_name"].astype(str).str.strip().str.title()
    df["district_name"] = df["district_name"].astype(str).str.strip().str.title()

    # Convert numeric enterprise counts
    for col in ["micro", "small", "medium", "total"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    logger.info(f"Cleaned Udyam MSME: {df.shape}")
    return df
