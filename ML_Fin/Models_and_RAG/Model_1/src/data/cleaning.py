"""
GramBiz Model 1 -- Data Cleaning Pipeline
==========================================
Reproducible cleaning for Census PCA and A-1 datasets.
Rules:
- Remove title/header/footer rows that are not observations
- Normalize column names to snake_case
- Normalize whitespace and encoding
- Distinguish zero from missing (Census has real zeros)
- Never modify raw files; output cleaned copies
"""

import logging
import re
from typing import Optional

import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def clean_census_pca(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean Census PCA DataFrame.

    Steps:
    1. Rename columns to snake_case
    2. Remove aggregate rows (India-level) -- keep STATE/DISTRICT/SUB-DISTRICT
    3. Ensure numeric columns are numeric
    4. Flag zero-population rows (uninhabited areas)
    5. Preserve source values

    Parameters
    ----------
    df : pd.DataFrame
        Raw Census PCA data from loaders.load_census_pca()

    Returns
    -------
    pd.DataFrame
        Cleaned Census data
    """
    logger.info(f"Cleaning Census PCA: {df.shape}")
    df = df.copy()

    # ---- Column renaming ----
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
        "M_06": "pop_0_6_male",
        "F_06": "pop_0_6_female",
        "P_SC": "pop_sc",
        "M_SC": "pop_sc_male",
        "F_SC": "pop_sc_female",
        "P_ST": "pop_st",
        "M_ST": "pop_st_male",
        "F_ST": "pop_st_female",
        "P_LIT": "pop_literate",
        "M_LIT": "pop_literate_male",
        "F_LIT": "pop_literate_female",
        "P_ILL": "pop_illiterate",
        "M_ILL": "pop_illiterate_male",
        "F_ILL": "pop_illiterate_female",
        "TOT_WORK_P": "workers_total",
        "TOT_WORK_M": "workers_total_male",
        "TOT_WORK_F": "workers_total_female",
        "MAINWORK_P": "workers_main",
        "MAINWORK_M": "workers_main_male",
        "MAINWORK_F": "workers_main_female",
        "MAIN_CL_P": "workers_cultivator",
        "MAIN_CL_M": "workers_cultivator_male",
        "MAIN_CL_F": "workers_cultivator_female",
        "MAIN_AL_P": "workers_agri_labour",
        "MAIN_AL_M": "workers_agri_labour_male",
        "MAIN_AL_F": "workers_agri_labour_female",
        "MAIN_HH_P": "workers_hh_industry",
        "MAIN_HH_M": "workers_hh_industry_male",
        "MAIN_HH_F": "workers_hh_industry_female",
        "MAIN_OT_P": "workers_other",
        "MAIN_OT_M": "workers_other_male",
        "MAIN_OT_F": "workers_other_female",
        "MARGWORK_P": "workers_marginal",
        "MARGWORK_M": "workers_marginal_male",
        "MARGWORK_F": "workers_marginal_female",
        "NON_WORK_P": "non_workers",
        "NON_WORK_M": "non_workers_male",
        "NON_WORK_F": "non_workers_female",
    }
    # Only rename columns that exist
    existing_renames = {k: v for k, v in rename_map.items() if k in df.columns}
    df = df.rename(columns=existing_renames)

    # Rename remaining columns that weren't explicitly mapped (marginal sub-categories)
    remaining = {c: c.lower() for c in df.columns if c not in existing_renames.values()}
    df = df.rename(columns=remaining)

    # ---- Clean name field ----
    df["name"] = df["name"].astype(str).str.strip()

    # ---- Ensure numeric columns ----
    numeric_cols = [c for c in df.columns if c not in [
        "state_code", "district_code", "subdistrict_code",
        "town_village_code", "ward_code", "eb_code",
        "level", "name", "tru",
    ]]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # ---- Flag zero-population rows ----
    df["is_uninhabited"] = df["population"] == 0

    # ---- Remove India aggregate row ----
    df = df[df["level"] != "India"].copy()

    # ---- Standardize codes and create geographic key ----
    df["state_code"] = df["state_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(2)
    df["district_code"] = df["district_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(3)
    df["subdistrict_code"] = df["subdistrict_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(5)

    df["geo_key"] = (
        df["state_code"] + "|"
        + df["district_code"] + "|"
        + df["subdistrict_code"]
    )

    logger.info(f"Cleaned Census PCA: {df.shape}, uninhabited: {df['is_uninhabited'].sum()}")
    return df


def clean_a1_villages(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean A-1 Villages DataFrame.

    Steps:
    1. Remove non-data rows
    2. Clean name annotations (remove @, $, * suffixes)
    3. Ensure numeric columns
    4. Standardize codes

    Parameters
    ----------
    df : pd.DataFrame
        Raw A-1 data from loaders.load_a1_villages()

    Returns
    -------
    pd.DataFrame
        Cleaned A-1 data
    """
    logger.info(f"Cleaning A-1 Villages: {df.shape}")
    df = df.copy()

    # ---- Clean name annotations ----
    # Census names contain markers like @ (for notes) and $ (for footnotes)
    df["name"] = (
        df["name"]
        .astype(str)
        .str.replace(r"[@$*#&]+", "", regex=True)
        .str.strip()
    )

    # ---- Standardize TRU ----
    tru_map = {"total": "Total", "rural": "Rural", "urban": "Urban"}
    df["tru"] = df["tru"].astype(str).str.strip().str.title()
    df["tru"] = df["tru"].replace(tru_map)

    # ---- Standardize codes ----
    df["state_code"] = df["state_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(2)
    df["district_code"] = df["district_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(3)
    df["subdistrict_code"] = df["subdistrict_code"].astype(str).str.strip().str.split(".").str[0].str.zfill(5)

    # ---- Create geographic key ----
    df["geo_key"] = (
        df["state_code"] + "|"
        + df["district_code"] + "|"
        + df["subdistrict_code"]
    )

    # ---- Remove impossible values ----
    df.loc[df["area_sqkm"] <= 0, "area_sqkm"] = np.nan
    df.loc[df["pop_density"] < 0, "pop_density"] = np.nan

    logger.info(f"Cleaned A-1: {df.shape}")
    return df


def clean_hces_mpce(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean HCES MPCE DataFrame.

    Steps:
    1. Standardize state names
    2. Filter to latest year
    3. Filter to 'Without Imputation' for consistency

    Parameters
    ----------
    df : pd.DataFrame
        Raw HCES MPCE from loaders.load_hces_mpce()

    Returns
    -------
    pd.DataFrame
        Cleaned HCES MPCE data
    """
    logger.info(f"Cleaning HCES MPCE: {df.shape}")
    df = df.copy()

    # Standardize state names
    df["States/Uts"] = df["States/Uts"].astype(str).str.strip()

    # Clean Year column - extract numeric year or convert safely
    if "Year" in df.columns:
        year_str = df["Year"].astype(str).str.extract(r"(\d{4})")[0]
        df["Year_num"] = pd.to_numeric(year_str, errors="coerce")
        latest_year = df["Year_num"].max()
        if pd.notna(latest_year):
            df = df[df["Year_num"] == latest_year].copy()
            logger.info(f"Filtered to latest year: {latest_year}")

    # Use 'Without Imputation' for consistency if column exists
    if "Imputation" in df.columns:
        df = df[df["Imputation"] == "Without Imputation"].copy()

    # Rename for clarity
    df = df.rename(columns={
        "States/Uts": "state_name",
        "Average MPCE (Rs.)": "mpce",
    })

    logger.info(f"Cleaned HCES MPCE: {df.shape}")
    return df


def clean_cpi_state(df: pd.DataFrame) -> pd.DataFrame:
    """Clean CPI state DataFrame."""
    logger.info(f"Cleaning CPI State: {df.shape}")
    df = df.copy()

    # Clean state names
    df["state"] = df["state"].astype(str).str.strip()

    # Remove footnote markers
    df["state"] = df["state"].str.replace(r"[*#]+$", "", regex=True).str.strip()

    # Remove rows with zero CPI (e.g., Chandigarh rural = 0.0)
    # Keep them but flag -- zero means data unavailable, not zero CPI
    df["cpi_rural_available"] = df["cpi_rural"] > 0
    df["cpi_urban_available"] = df["cpi_urban"] > 0

    logger.info(f"Cleaned CPI: {df.shape}")
    return df
