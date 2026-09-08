"""
GramBiz Model 3 — Price Unit Normalization Layer
=================================================
Standardizes price units into canonical ₹/quintal (100 kg).
Tracks:
- original_price
- original_unit
- normalized_price
- normalized_unit
- conversion_rule
- conversion_source
"""

import pandas as pd
from typing import Tuple, Dict, Any
from src.utils.config import CANONICAL_PRICE_UNIT


# Unit conversion factors relative to ₹/quintal (1 Quintal = 100 kg)
UNIT_CONVERSION_FACTORS = {
    "quintal": 1.0,
    "qtl": 1.0,
    "100 kg": 1.0,
    "kg": 100.0,            # ₹/kg -> multiply by 100 to get ₹/quintal
    "kilogram": 100.0,
    "tonne": 0.1,           # ₹/tonne -> divide by 10 (multiply by 0.1)
    "ton": 0.1,
    "litre": 100.0,         # approx 100 L = 1 quintal for liquids (e.g. Milk)
    "liter": 100.0,
    "dozen": 100.0 / 12.0,  # approx scaling for pieces/dozens
}


class UnitNormalizer:
    @staticmethod
    def normalize_record(price: float, unit_raw: str) -> Dict[str, Any]:
        """Normalizes a single price and unit to canonical ₹/quintal."""
        if pd.isna(price) or price <= 0:
            return {
                "original_price": price,
                "original_unit": str(unit_raw),
                "normalized_price": None,
                "normalized_unit": CANONICAL_PRICE_UNIT,
                "conversion_rule": "invalid_price",
                "conversion_source": "AGMARKNET Standard Rules",
                "is_usable": False
            }

        unit_str = str(unit_raw).strip().lower() if unit_raw else "quintal"

        # Default AGMARKNET unit is quintal if unspecified or standard
        factor = 1.0
        conversion_rule = "identity (already quintal)"
        
        for k, f in UNIT_CONVERSION_FACTORS.items():
            if k in unit_str:
                factor = f
                conversion_rule = f"multiply by {f}" if f != 1.0 else "identity"
                break

        norm_price = round(float(price) * factor, 2)

        return {
            "original_price": float(price),
            "original_unit": str(unit_raw),
            "normalized_price": norm_price,
            "normalized_unit": CANONICAL_PRICE_UNIT,
            "conversion_rule": conversion_rule,
            "conversion_source": "AGMARKNET Standard Rules",
            "is_usable": True
        }

    @classmethod
    def normalize_dataframe(cls, df: pd.DataFrame, price_col: str = "modal_price", unit_col: str = None) -> pd.DataFrame:
        """Normalizes an entire dataframe's price column to canonical ₹/quintal."""
        df_out = df.copy()

        orig_prices = df_out[price_col].values
        norm_prices = []
        is_usable_flags = []

        for i, price in enumerate(orig_prices):
            unit_val = df_out[unit_col].iloc[i] if unit_col and unit_col in df_out.columns else "quintal"
            res = cls.normalize_record(price, unit_val)
            norm_prices.append(res["normalized_price"])
            is_usable_flags.append(res["is_usable"])

        df_out["original_price"] = df_out[price_col]
        df_out["original_unit"] = df_out[unit_col] if unit_col and unit_col in df_out.columns else "quintal"
        df_out["normalized_price"] = norm_prices
        df_out["normalized_unit"] = CANONICAL_PRICE_UNIT
        df_out["is_unit_usable"] = is_usable_flags

        return df_out
