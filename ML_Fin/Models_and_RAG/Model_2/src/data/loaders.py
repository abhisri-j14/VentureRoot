"""
GramBiz Model 2 -- Data Loaders
=================================
Reproducible loaders for Census 2011, Udyam MSME Registration, and ASI statistics.
"""

import logging
import os
import sys
from typing import Optional

import numpy as np
import pandas as pd

from src.config import BASE_DIR, RAW_DATA_DIR

logger = logging.getLogger(__name__)


def load_census_pca(
    level: Optional[str] = "SUB-DISTRICT",
    tru: Optional[str] = "Rural",
) -> pd.DataFrame:
    """Load Census 2011 Primary Census Abstract."""
    path = os.path.join(RAW_DATA_DIR, "census", "2011-IndiaStateDistSbDistTwn-0000.xlsx")
    logger.info(f"Loading Census PCA from: {path}")
    df = pd.read_excel(path, sheet_name="Data", engine="openpyxl")

    for col in ["State", "District", "Subdistt", "Town/Village"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.zfill(
                {"State": 2, "District": 3, "Subdistt": 5, "Town/Village": 6}.get(col, 2)
            )

    if level is not None and "Level" in df.columns:
        df = df[df["Level"] == level].copy()

    if tru is not None and "TRU" in df.columns:
        df = df[df["TRU"] == tru].copy()

    logger.info(f"Census PCA loaded: {df.shape}")
    return df


def load_a1_villages(
    level: Optional[str] = "SUB-DISTRICT",
    tru: Optional[str] = "Rural",
) -> pd.DataFrame:
    """Load Census 2011 A-1 Villages & Households."""
    path = os.path.join(RAW_DATA_DIR, "census", "A-1_NO_OF_VILLAGES_TOWNS_HOUSEHOLDS_POPULATION_AND_AREA.xlsx")
    logger.info(f"Loading A-1 Villages from: {path}")

    a1_cols = [
        "state_code", "district_code", "subdistrict_code",
        "level_indicator", "name", "tru",
        "villages_inhabited", "villages_uninhabited",
        "num_towns", "num_households",
        "pop_persons", "pop_males", "pop_females",
        "area_sqkm", "pop_density",
    ]
    df = pd.read_excel(path, header=None, skiprows=4, engine="openpyxl")
    df.columns = a1_cols

    for col in ["state_code", "district_code", "subdistrict_code"]:
        df[col] = df[col].astype(str).str.strip().str.zfill(
            {"state_code": 2, "district_code": 3, "subdistrict_code": 5}.get(col, 2)
        )

    valid_levels = {"INDIA", "STATE", "DISTRICT", "SUB-DISTRICT"}
    df["level_indicator"] = df["level_indicator"].astype(str).str.strip().str.upper()
    df = df[df["level_indicator"].isin(valid_levels)].copy()

    if level is not None:
        df = df[df["level_indicator"] == level.upper()].copy()

    if tru is not None:
        df = df[df["tru"].astype(str).str.strip().str.title() == tru.title()].copy()

    logger.info(f"A-1 Villages loaded: {df.shape}")
    return df


def load_udyam_msme() -> pd.DataFrame:
    """Load District-wise Udyam MSME Registration Data."""
    # File: f8cd85a1-f9b8-4ff1-b195-9f75c10eb338.csv or c3dfe7e6-0cfd-4ddb-8f79-9cb3695d9866.csv
    file1 = os.path.join(RAW_DATA_DIR, "f8cd85a1-f9b8-4ff1-b195-9f75c10eb338.csv")
    file2 = os.path.join(RAW_DATA_DIR, "c3dfe7e6-0cfd-4ddb-8f79-9cb3695d9866.csv")

    path = file1 if os.path.exists(file1) else file2
    logger.info(f"Loading Udyam MSME Registration Data from: {path}")

    df = pd.read_csv(path)
    df["state_name"] = df["state_name"].astype(str).str.strip()
    df["district_name"] = df["district_name"].astype(str).str.strip()

    logger.info(f"Udyam MSME loaded: {df.shape}")
    return df


def load_asi_factories() -> pd.DataFrame:
    """Load ASI factory statistics."""
    path = os.path.join(RAW_DATA_DIR, "Table3_Principal_Characterstics_By_Major_States_2012-2013.csv")
    logger.info(f"Loading ASI Factory Statistics from: {path}")
    df = pd.read_csv(path)
    df["States"] = df["States"].astype(str).str.strip()
    logger.info(f"ASI Factories loaded: {df.shape}")
    return df
