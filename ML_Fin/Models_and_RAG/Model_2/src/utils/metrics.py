"""
GramBiz Model 2 -- Utility & Mathematical Metrics
===================================================
Provides safe division, min-max scaling, bounding primitives,
and string hashing functions.
"""

import hashlib
import numpy as np
import pandas as pd


def safe_ratio(
    numerator: pd.Series,
    denominator: pd.Series,
    fill_value: float = 0.0,
    multiplier: float = 1.0,
) -> pd.Series:
    """
    Safely divide two pandas Series handling zero denominators.

    Parameters
    ----------
    numerator : pd.Series
    denominator : pd.Series
    fill_value : float
        Value to use when denominator is 0 or NaN.
    multiplier : float
        Scaling multiplier.

    Returns
    -------
    pd.Series
    """
    num = pd.to_numeric(numerator, errors="coerce").fillna(0.0)
    den = pd.to_numeric(denominator, errors="coerce").fillna(0.0)

    ratio = np.where(den > 0, (num / den) * multiplier, fill_value)
    return pd.Series(ratio, index=numerator.index)


def min_max_scale(
    series: pd.Series,
    target_min: float = 0.0,
    target_max: float = 100.0,
) -> pd.Series:
    """Scale a series to [target_min, target_max]."""
    s_min = series.min()
    s_max = series.max()
    if pd.isna(s_min) or pd.isna(s_max) or s_max == s_min:
        return pd.Series(target_min, index=series.index)
    scaled = (series - s_min) / (s_max - s_min)
    return scaled * (target_max - target_min) + target_min


def compute_string_hash(val: str) -> str:
    """Compute MD5 hash of string."""
    return hashlib.md5(str(val).encode("utf-8")).hexdigest()
