"""
GramBiz Model 3 — Geographic Normalization Utility
===================================================
Standardizes State, District, and Market names into canonical formats.
Fixes common spelling variants (e.g., Keralam -> Kerala, Thirupur -> Tiruppur).
"""

import re
import pandas as pd
from typing import Dict

STATE_NAME_MAPPINGS: Dict[str, str] = {
    "keralam": "Kerala",
    "kerala": "Kerala",
    "west bengal": "West Bengal",
    "paschim banga": "West Bengal",
    "wb": "West Bengal",
    "andhra pradesh": "Andhra Pradesh",
    "ap": "Andhra Pradesh",
    "tamil nadu": "Tamil Nadu",
    "tn": "Tamil Nadu",
    "telangana": "Telangana",
    "tripura": "Tripura",
    "maharashtra": "Maharashtra",
    "mh": "Maharashtra",
    "karnataka": "Karnataka",
    "gujarat": "Gujarat",
    "madhya pradesh": "Madhya Pradesh",
    "mp": "Madhya Pradesh",
    "rajasthan": "Rajasthan",
    "uttar pradesh": "Uttar Pradesh",
    "up": "Uttar Pradesh",
    "punjab": "Punjab",
    "haryana": "Haryana",
    "odisha": "Odisha",
    "orissa": "Odisha",
    "bihar": "Bihar",
    "assam": "Assam"
}

DISTRICT_NAME_MAPPINGS: Dict[str, str] = {
    "kozhikode(calicut)": "Kozhikode",
    "kozhikode": "Kozhikode",
    "calicut": "Kozhikode",
    "thirupur": "Tiruppur",
    "tiruppur": "Tiruppur",
    "dhalai": "Dhalai",
    "ranga reddy": "Ranga Reddy",
    "rangareddy": "Ranga Reddy",
    "alappuzha": "Alappuzha",
    "nandyal": "Nandyal",
    "ernakulam": "Ernakulam",
    "erode": "Erode",
    "dharmapuri": "Dharmapuri",
    "dindigul": "Dindigul",
    "kallakuruchi": "Kallakurichi",
    "kallakurichi": "Kallakurichi",
    "krishnagiri": "Krishnagiri",
    "madurai": "Madurai",
    "nagapattinam": "Nagapattinam",
    "namakkal": "Namakkal",
    "perambalur": "Perambalur",
    "salem": "Salem",
    "ranipet": "Ranipet",
    "thiruchirappalli": "Tiruchirappalli",
    "trichy": "Tiruchirappalli",
    "theni": "Theni",
    "thirunelveli": "Tirunelveli",
    "thiruvannamalai": "Tiruvannamalai",
    "thiruvarur": "Tiruvarur",
    "coimbatore": "Coimbatore",
    "pudukkottai": "Pudukkottai",
    "cuddalore": "Cuddalore",
    "thanjavur": "Thanjavur",
    "karur": "Karur",
    "sivaganga": "Sivaganga"
}


class GeographicNormalizer:
    @staticmethod
    def clean_name(name: str) -> str:
        """Trims whitespace and normalizes text capitalization."""
        if not name or pd.isna(name):
            return "Unknown"
        s = str(name).strip()
        s = re.sub(r"\s+", " ", s)
        return s

    @classmethod
    def normalize_state(cls, state: str) -> str:
        clean = cls.clean_name(state)
        lower = clean.lower()
        return STATE_NAME_MAPPINGS.get(lower, clean.title())

    @classmethod
    def normalize_district(cls, district: str) -> str:
        clean = cls.clean_name(district)
        lower = clean.lower()
        return DISTRICT_NAME_MAPPINGS.get(lower, clean.title())

    @classmethod
    def normalize_market(cls, market: str) -> str:
        clean = cls.clean_name(market)
        # Remove trailing APMC / Uzhavar Sandhai parentheses noise if clean
        clean_std = re.sub(r"\s*\((?:Uzhavar Sandhai|APMC)\s*\)", "", clean, flags=re.IGNORECASE).strip()
        return clean_std if clean_std else clean

    @classmethod
    def normalize_dataframe(cls, df: pd.DataFrame, state_col: str = "state", district_col: str = "district", market_col: str = "market") -> pd.DataFrame:
        """Normalizes state, district, and market columns in a DataFrame."""
        df_out = df.copy()
        if state_col in df_out.columns:
            df_out[state_col] = df_out[state_col].apply(cls.normalize_state)
        if district_col in df_out.columns:
            df_out[district_col] = df_out[district_col].apply(cls.normalize_district)
        if market_col in df_out.columns:
            df_out[market_col] = df_out[market_col].apply(cls.normalize_market)
        return df_out
