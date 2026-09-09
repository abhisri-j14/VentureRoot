"""
GramBiz Model 1 -- Geographic Normalization
=============================================
Standardize state/district/sub-district names across datasets
that use different naming conventions.

Census 2011 uses UPPERCASE names.
HCES uses Title Case names.
CPI uses mixed case with footnote markers.

This module creates a canonical mapping and geography master table.
"""

import logging
import re
from typing import Dict, Optional

import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# ====================================================================
# State Name Mapping: Census UPPERCASE -> Normalized Title Case
# ====================================================================

# Census 2011 state names (UPPERCASE) mapped to canonical names
# This covers all 35 states/UTs in Census 2011
CENSUS_STATE_NAME_MAP: Dict[str, str] = {
    "JAMMU & KASHMIR": "Jammu & Kashmir",
    "HIMACHAL PRADESH": "Himachal Pradesh",
    "PUNJAB": "Punjab",
    "CHANDIGARH": "Chandigarh",
    "UTTARAKHAND": "Uttarakhand",
    "HARYANA": "Haryana",
    "NCT OF DELHI": "Delhi",
    "RAJASTHAN": "Rajasthan",
    "UTTAR PRADESH": "Uttar Pradesh",
    "BIHAR": "Bihar",
    "SIKKIM": "Sikkim",
    "ARUNACHAL PRADESH": "Arunachal Pradesh",
    "NAGALAND": "Nagaland",
    "MANIPUR": "Manipur",
    "MIZORAM": "Mizoram",
    "TRIPURA": "Tripura",
    "MEGHALAYA": "Meghalaya",
    "ASSAM": "Assam",
    "WEST BENGAL": "West Bengal",
    "JHARKHAND": "Jharkhand",
    "ODISHA": "Odisha",
    "CHHATTISGARH": "Chhattisgarh",
    "MADHYA PRADESH": "Madhya Pradesh",
    "GUJARAT": "Gujarat",
    "DAMAN & DIU": "Daman & Diu",
    "DADRA & NAGAR HAVELI": "Dadra & Nagar Haveli",
    "MAHARASHTRA": "Maharashtra",
    "ANDHRA PRADESH": "Andhra Pradesh",
    "KARNATAKA": "Karnataka",
    "GOA": "Goa",
    "LAKSHADWEEP": "Lakshadweep",
    "KERALA": "Kerala",
    "TAMIL NADU": "Tamil Nadu",
    "PUDUCHERRY": "Puducherry",
    "ANDAMAN & NICOBAR ISLANDS": "Andaman & Nicobar Islands",
    "TELANGANA": "Telangana",
}

# HCES state names that differ from canonical
HCES_STATE_NAME_MAP: Dict[str, str] = {
    "Andaman And Nicobar Islands": "Andaman & Nicobar Islands",
    "Dadra And Nagar Haveli And Daman And Diu": "Dadra & Nagar Haveli",
    "Jammu And Kashmir": "Jammu & Kashmir",
    "Nct Of Delhi": "Delhi",
    "NCT of Delhi": "Delhi",
    "Telengana": "Telangana",
    "Orissa": "Odisha",
    "Pondicherry": "Puducherry",
}

# CPI state names that differ from canonical
CPI_STATE_NAME_MAP: Dict[str, str] = {
    "Andaman And Nicobar Islands": "Andaman & Nicobar Islands",
    "D & N Haveli And Daman & Diu": "Dadra & Nagar Haveli",
    "Jammu And Kashmir": "Jammu & Kashmir",
    "NCT of Delhi": "Delhi",
    "Nct Of Delhi": "Delhi",
    "Telengana": "Telangana",
    "Orissa": "Odisha",
    "Pondicherry": "Puducherry",
}


def normalize_state_name(name: str, source: str = "census") -> str:
    """
    Normalize a state name to canonical form.

    Parameters
    ----------
    name : str
        Raw state name from a dataset.
    source : str
        Source dataset: 'census', 'hces', 'cpi'.

    Returns
    -------
    str
        Canonical state name.
    """
    name = str(name).strip()
    # Remove footnote markers
    name = re.sub(r"[*#@$&]+$", "", name).strip()

    name_upper = name.upper()
    if name_upper in CENSUS_STATE_NAME_MAP:
        return CENSUS_STATE_NAME_MAP[name_upper]

    # Additional alias mappings
    alias_map = {
        "WB": "West Bengal",
        "UP": "Uttar Pradesh",
        "ORISSA": "Odisha",
        "PONDICHERRY": "Puducherry",
    }
    if name_upper in alias_map:
        return alias_map[name_upper]

    if source == "hces" and name in HCES_STATE_NAME_MAP:
        return HCES_STATE_NAME_MAP[name]
    elif source == "cpi" and name in CPI_STATE_NAME_MAP:
        return CPI_STATE_NAME_MAP[name]

    return name.title()


def normalize_district_name(name: str, state_name: Optional[str] = None) -> str:
    """
    Normalize a district name.

    Steps:
    - Strip whitespace
    - Remove footnote markers
    - Title case
    - Normalize common variations
    """
    name = str(name).strip()
    name = re.sub(r"[*#@$&]+", "", name).strip()
    name = re.sub(r"\s+", " ", name)
    titled = name.title()

    aliases = {
        "24 Parganas South": "South 24 Parganas",
        "24 Parganas North": "North 24 Parganas",
        "Gurgaon": "Gurugram",
    }
    return aliases.get(titled, titled)


def build_geography_master(
    census_df: pd.DataFrame,
    a1_df: Optional[pd.DataFrame] = None,
) -> pd.DataFrame:
    """
    Build a master geography table from cleaned Census PCA data.

    Parameters
    ----------
    census_df : pd.DataFrame
        Cleaned Census PCA (sub-district level, Rural TRU).
    a1_df : pd.DataFrame, optional
        Cleaned A-1 data (for area information).

    Returns
    -------
    pd.DataFrame
        Geography master with canonical names and codes.
    """
    logger.info("Building geography master table...")

    # Extract unique sub-districts from census
    geo_cols = ["state_code", "district_code", "subdistrict_code", "level", "name", "tru"]
    available_cols = [c for c in geo_cols if c in census_df.columns]
    geo = census_df[available_cols].copy()

    # Add normalized state name
    # To get state name, we need to look up the state from district-level or state-level rows
    # For sub-district rows, 'name' is the sub-district name, not the state name
    # We need a separate state name lookup

    # Build state code -> state name lookup from STATE-level rows
    # This requires the full census data; for now use the mapping
    geo["state_name"] = geo["state_code"].map(
        lambda code: _state_code_to_name(code)
    )

    # District name lookup from DISTRICT-level rows
    geo["district_name"] = geo["name"].apply(normalize_district_name)
    geo["subdistrict_name"] = geo["name"].apply(normalize_district_name)

    # Create geographic key
    geo["geo_key"] = (
        geo["state_code"] + "|"
        + geo["district_code"] + "|"
        + geo["subdistrict_code"]
    )

    # Add geographic level
    geo["geographic_level"] = geo["level"]

    logger.info(f"Geography master: {geo.shape}")
    return geo


def _state_code_to_name(code: str) -> str:
    """Map Census 2011 state code to canonical state name."""
    code = str(code).strip().zfill(2)
    state_code_map = {
        "01": "Jammu & Kashmir",
        "02": "Himachal Pradesh",
        "03": "Punjab",
        "04": "Chandigarh",
        "05": "Uttarakhand",
        "06": "Haryana",
        "07": "Delhi",
        "08": "Rajasthan",
        "09": "Uttar Pradesh",
        "10": "Bihar",
        "11": "Sikkim",
        "12": "Arunachal Pradesh",
        "13": "Nagaland",
        "14": "Manipur",
        "15": "Mizoram",
        "16": "Tripura",
        "17": "Meghalaya",
        "18": "Assam",
        "19": "West Bengal",
        "20": "Jharkhand",
        "21": "Odisha",
        "22": "Chhattisgarh",
        "23": "Madhya Pradesh",
        "24": "Gujarat",
        "25": "Daman & Diu",
        "26": "Dadra & Nagar Haveli",
        "27": "Maharashtra",
        "28": "Andhra Pradesh",
        "29": "Karnataka",
        "30": "Goa",
        "31": "Lakshadweep",
        "32": "Kerala",
        "33": "Tamil Nadu",
        "34": "Puducherry",
        "35": "Andaman & Nicobar Islands",
    }
    return state_code_map.get(code, f"Unknown ({code})")


def build_state_name_to_code_map() -> Dict[str, str]:
    """Return canonical state name -> Census 2011 state code mapping."""
    return {v: k for k, v in {
        "01": "Jammu & Kashmir", "02": "Himachal Pradesh",
        "03": "Punjab", "04": "Chandigarh", "05": "Uttarakhand",
        "06": "Haryana", "07": "Delhi", "08": "Rajasthan",
        "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim",
        "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
        "15": "Mizoram", "16": "Tripura", "17": "Meghalaya",
        "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
        "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh",
        "24": "Gujarat", "25": "Daman & Diu", "26": "Dadra & Nagar Haveli",
        "27": "Maharashtra", "28": "Andhra Pradesh", "29": "Karnataka",
        "30": "Goa", "31": "Lakshadweep", "32": "Kerala",
        "33": "Tamil Nadu", "34": "Puducherry",
        "35": "Andaman & Nicobar Islands",
    }.items()}
