"""
GramBiz Model 1 — Data Loaders
================================
Reproducible loaders for all raw datasets.
Each loader handles merged cells, header rows, and encoding issues
specific to its source file.

All paths are resolved relative to the project base directory.
"""

import os
import logging
from typing import Optional

import pandas as pd
import numpy as np
import yaml

logger = logging.getLogger(__name__)

# ── Project base directory ──────────────────────────────────────────
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def _resolve(path: str) -> str:
    """Resolve a relative path against the project base directory."""
    return os.path.join(BASE_DIR, path)


def load_data_config() -> dict:
    """Load data configuration from configs/data_config.yaml."""
    config_path = _resolve("configs/data_config.yaml")
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


# ====================================================================
# 1. Census 2011 — Primary Census Abstract
# ====================================================================

def load_census_pca(
    level: Optional[str] = None,
    tru: Optional[str] = None,
    use_full: bool = True,
) -> pd.DataFrame:
    """
    Load Census 2011 Primary Census Abstract.

    Parameters
    ----------
    level : str, optional
        Filter by geographic level: 'India', 'STATE', 'DISTRICT',
        'SUB-DISTRICT', 'TOWN'. Default: no filter (all levels).
    tru : str, optional
        Filter by Total/Rural/Urban. Default: no filter.
    use_full : bool
        If True, use the full granularity file (State->District->SubDist->Town).
        If False, use the smaller State->District file.

    Returns
    -------
    pd.DataFrame
        Census PCA data with 94 columns.
    """
    config = load_data_config()
    if use_full:
        path = _resolve(config["raw_data"]["census"]["pca_full"])
    else:
        path = _resolve(config["raw_data"]["census"]["pca_state_dist"])

    logger.info(f"Loading Census PCA from: {path}")
    df = pd.read_excel(path, sheet_name="Data", engine="openpyxl")

    # Ensure code columns are strings for consistent merging
    for col in ["State", "District", "Subdistt", "Town/Village"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.zfill(
                {"State": 2, "District": 3, "Subdistt": 5, "Town/Village": 6}.get(col, 2)
            )

    if level is not None:
        df = df[df["Level"] == level].copy()
        logger.info(f"Filtered to Level={level}: {len(df)} rows")

    if tru is not None:
        df = df[df["TRU"] == tru].copy()
        logger.info(f"Filtered to TRU={tru}: {len(df)} rows")

    logger.info(f"Census PCA loaded: {df.shape}")
    return df


# ====================================================================
# 2. A-1 — Villages, Towns, Households, Population, Area
# ====================================================================

# Column names for A-1 after skipping header rows
A1_COLUMNS = [
    "state_code", "district_code", "subdistrict_code",
    "level_indicator", "name", "tru",
    "villages_inhabited", "villages_uninhabited",
    "num_towns", "num_households",
    "pop_persons", "pop_males", "pop_females",
    "area_sqkm", "pop_density",
]


def load_a1_villages(
    level: Optional[str] = None,
    tru: Optional[str] = None,
) -> pd.DataFrame:
    """
    Load Census 2011 A-1 (Villages, Towns, Households, Population, Area).

    This file has 4 header/title rows that must be skipped.

    Parameters
    ----------
    level : str, optional
        Filter by level_indicator: 'INDIA', 'STATE', 'DISTRICT', 'SUB-DISTRICT'.
    tru : str, optional
        Filter by Total/Rural/Urban.

    Returns
    -------
    pd.DataFrame
        A-1 data with standardized column names.
    """
    config = load_data_config()
    path = _resolve(config["raw_data"]["census"]["a1_villages"])

    logger.info(f"Loading A-1 Villages from: {path}")
    df = pd.read_excel(path, header=None, skiprows=4, engine="openpyxl")

    # Assign standardized column names
    df.columns = A1_COLUMNS

    # Clean code columns
    for col in ["state_code", "district_code", "subdistrict_code"]:
        df[col] = df[col].astype(str).str.strip()

    # Clean name column
    df["name"] = df["name"].astype(str).str.strip()

    # Standardize TRU values
    df["tru"] = df["tru"].astype(str).str.strip()

    # Remove non-data rows (e.g., column-number rows, NaN rows)
    # level_indicator should be one of the known values
    valid_levels = {"INDIA", "STATE", "DISTRICT", "SUB-DISTRICT"}
    df["level_indicator"] = df["level_indicator"].astype(str).str.strip().str.upper()
    df = df[df["level_indicator"].isin(valid_levels)].copy()

    # Convert numeric columns
    numeric_cols = [
        "villages_inhabited", "villages_uninhabited", "num_towns",
        "num_households", "pop_persons", "pop_males", "pop_females",
        "area_sqkm", "pop_density",
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    if level is not None:
        df = df[df["level_indicator"] == level.upper()].copy()

    if tru is not None:
        df = df[df["tru"] == tru].copy()

    logger.info(f"A-1 loaded: {df.shape}")
    return df


# ====================================================================
# 3. HCES — Household Consumption Expenditure Survey
# ====================================================================

def load_hces_mpce() -> pd.DataFrame:
    """
    Load state-level Monthly Per Capita Consumption Expenditure (MPCE).

    Returns
    -------
    pd.DataFrame
        Columns: Year, States/Uts, Sector, Imputation, Average MPCE (Rs.)
    """
    config = load_data_config()
    path = _resolve(config["raw_data"]["consumption"]["hces"])
    sheet = config["raw_data"]["consumption"]["hces_sheet_mpce"]

    logger.info(f"Loading HCES MPCE from: {path} [{sheet}]")
    df = pd.read_excel(path, sheet_name=sheet, engine="openpyxl")

    # Standardize state names
    df["States/Uts"] = df["States/Uts"].astype(str).str.strip()

    logger.info(f"HCES MPCE loaded: {df.shape}")
    return df


def load_hces_composition() -> pd.DataFrame:
    """Load HCES consumption composition (food vs non-food % breakdown)."""
    config = load_data_config()
    path = _resolve(config["raw_data"]["consumption"]["hces"])
    sheet = config["raw_data"]["consumption"]["hces_sheet_composition"]

    df = pd.read_excel(path, sheet_name=sheet, engine="openpyxl")
    logger.info(f"HCES Composition loaded: {df.shape}")
    return df


# ====================================================================
# 4. CPI — Consumer Price Index (State-level)
# ====================================================================

CPI_STATE_COLUMNS = [
    "sno", "state",
    "cpi_rural", "cpi_urban", "cpi_combined",
    "inflation_rural", "inflation_urban", "inflation_combined",
]


def load_cpi_state() -> pd.DataFrame:
    """
    Load state/UT-level CPI and inflation from Annex-III.

    Returns
    -------
    pd.DataFrame
        State-level CPI (Rural/Urban/Combined) and Inflation %.
    """
    config = load_data_config()
    path = _resolve(config["raw_data"]["macro"]["cpi_state"])

    logger.info(f"Loading CPI State from: {path}")
    df = pd.read_excel(path, header=None, skiprows=4, engine="openpyxl")
    df.columns = CPI_STATE_COLUMNS

    # Remove NaN state rows and clean
    df = df.dropna(subset=["state"]).copy()
    df["state"] = df["state"].astype(str).str.strip()

    # Remove serial number artifacts
    df = df[~df["state"].str.match(r"^\d+\.?$", na=True)].copy()

    # Convert numeric
    for col in CPI_STATE_COLUMNS[2:]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    logger.info(f"CPI State loaded: {df.shape}")
    return df


# ====================================================================
# 5. LFPR / WPR — Labour Force & Worker Population Ratio
# ====================================================================

def load_lfpr() -> pd.DataFrame:
    """
    Load Labour Force Participation Rate.
    National-level only (Rural/Urban/Combined), no state/district breakdown.

    Returns
    -------
    pd.DataFrame
        Columns: Month, Sector, Age Group, Male, Female, Person
    """
    config = load_data_config()
    path = _resolve(config["raw_data"]["labour"]["lfpr"])
    header_row = config["raw_data"]["labour"]["header_row"]

    df = pd.read_excel(path, header=header_row, engine="openpyxl")
    df.columns = ["Month", "Sector", "Age Group", "Male", "Female", "Person"]
    df["Sector"] = df["Sector"].astype(str).str.strip()
    df["Age Group"] = df["Age Group"].astype(str).str.strip()

    logger.info(f"LFPR loaded: {df.shape}")
    return df


def load_wpr() -> pd.DataFrame:
    """
    Load Worker Population Ratio.
    National-level only (Rural/Urban/Combined), no state/district breakdown.

    Returns
    -------
    pd.DataFrame
        Columns: Month, Sector, Age Group, Male, Female, Person
    """
    config = load_data_config()
    path = _resolve(config["raw_data"]["labour"]["wpr"])
    header_row = config["raw_data"]["labour"]["header_row"]

    df = pd.read_excel(path, header=header_row, engine="openpyxl")
    df.columns = ["Month", "Sector", "Age Group", "Male", "Female", "Person"]
    df["Sector"] = df["Sector"].astype(str).str.strip()
    df["Age Group"] = df["Age Group"].astype(str).str.strip()

    logger.info(f"WPR loaded: {df.shape}")
    return df
