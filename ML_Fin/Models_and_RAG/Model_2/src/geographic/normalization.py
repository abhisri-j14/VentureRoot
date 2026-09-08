"""
GramBiz Model 2 -- Geographic Normalization
=============================================
Standardize state/district/sub-district names across Census 2011,
Udyam MSME, and ASI datasets.
"""

import logging
import re
from typing import Dict, Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# State Name Mapping (Census / Udyam / ASI -> Canonical Title Case)
STATE_NAME_MAP: Dict[str, str] = {
    "JAMMU & KASHMIR": "Jammu & Kashmir",
    "HIMACHAL PRADESH": "Himachal Pradesh",
    "PUNJAB": "Punjab",
    "CHANDIGARH": "Chandigarh",
    "UTTARAKHAND": "Uttarakhand",
    "HARYANA": "Haryana",
    "NCT OF DELHI": "Delhi",
    "DELHI": "Delhi",
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
    "ORISSA": "Odisha",
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
    "PONDICHERRY": "Puducherry",
    "ANDAMAN & NICOBAR ISLANDS": "Andaman & Nicobar Islands",
    "TELANGANA": "Telangana",
    "TELENGANA": "Telangana",
    "WB": "West Bengal",
    "UP": "Uttar Pradesh",
}


def normalize_state_name(name: str) -> str:
    """Normalize state name to canonical form."""
    name = str(name).strip()
    name = re.sub(r"[*#@$&]+$", "", name).strip()
    name_upper = name.upper()
    return STATE_NAME_MAP.get(name_upper, name.title())


def normalize_district_name(name: str, state_name: Optional[str] = None) -> str:
    """Normalize district name."""
    name = str(name).strip()
    name = re.sub(r"[*#@$&]+", "", name).strip()
    name = re.sub(r"\s+", " ", name)
    titled = name.title()

    aliases = {
        "24 Parganas South": "South 24 Parganas",
        "24 Parganas North": "North 24 Parganas",
        "Gurgaon": "Gurugram",
        "Bangalore Urban": "Bengaluru Urban",
        "Bangalore Rural": "Bengaluru Rural",
    }
    return aliases.get(titled, titled)


def _state_code_to_name(code: str) -> str:
    """Map Census 2011 state code to canonical state name."""
    code = str(code).strip().zfill(2)
    state_code_map = {
        "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
        "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana", "07": "Delhi",
        "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim",
        "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
        "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
        "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh",
        "24": "Gujarat", "25": "Daman & Diu", "26": "Dadra & Nagar Haveli",
        "27": "Maharashtra", "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
        "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
        "35": "Andaman & Nicobar Islands",
    }
    return state_code_map.get(code, f"Unknown ({code})")
