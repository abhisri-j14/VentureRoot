"""
GramBiz Model 1 -- Data Validation
====================================
Validation checks for data quality after loading and cleaning.
"""

import logging
from typing import List, Tuple

import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def validate_no_duplicate_geo_keys(df: pd.DataFrame, key_col: str = "geo_key") -> Tuple[bool, int]:
    """Check for duplicate geographic keys."""
    dups = df[key_col].duplicated().sum()
    if dups > 0:
        logger.warning(f"Found {dups} duplicate geographic keys!")
    return dups == 0, dups


def validate_population_positive(df: pd.DataFrame, col: str = "population") -> Tuple[bool, int]:
    """Check that inhabited areas have positive population."""
    if "is_uninhabited" in df.columns:
        inhabited = df[~df["is_uninhabited"]]
    else:
        inhabited = df
    invalid = (inhabited[col] <= 0).sum()
    if invalid > 0:
        logger.warning(f"Found {invalid} inhabited rows with non-positive population!")
    return invalid == 0, invalid


def validate_ratios_bounded(df: pd.DataFrame, ratio_cols: List[str]) -> dict:
    """Check that ratio columns are in [0, 1]."""
    results = {}
    for col in ratio_cols:
        if col not in df.columns:
            continue
        below = (df[col] < 0).sum()
        above = (df[col] > 1).sum()
        nan_count = df[col].isna().sum()
        results[col] = {
            "below_zero": int(below),
            "above_one": int(above),
            "nan_count": int(nan_count),
            "valid": below == 0 and above == 0,
        }
        if below > 0 or above > 0:
            logger.warning(f"Ratio {col}: {below} below 0, {above} above 1")
    return results


def validate_merge_coverage(
    left: pd.DataFrame,
    right: pd.DataFrame,
    on: str,
    left_name: str = "left",
    right_name: str = "right",
) -> dict:
    """Check merge coverage between two datasets."""
    left_keys = set(left[on].unique())
    right_keys = set(right[on].unique())
    matched = left_keys & right_keys
    left_only = left_keys - right_keys
    right_only = right_keys - left_keys
    coverage = len(matched) / max(len(left_keys), 1) * 100

    result = {
        "left_total": len(left_keys),
        "right_total": len(right_keys),
        "matched": len(matched),
        "left_only": len(left_only),
        "right_only": len(right_only),
        "coverage_pct": round(coverage, 2),
    }

    if left_only:
        logger.info(f"Merge: {len(left_only)} keys in {left_name} not in {right_name}")
    if right_only:
        logger.info(f"Merge: {len(right_only)} keys in {right_name} not in {left_name}")

    return result


def validate_no_nan_in_target(df: pd.DataFrame, target_col: str) -> Tuple[bool, int]:
    """Check that the target column has no NaN values."""
    nan_count = df[target_col].isna().sum()
    if nan_count > 0:
        logger.warning(f"Target column '{target_col}' has {nan_count} NaN values!")
    return nan_count == 0, nan_count


def generate_missing_report(df: pd.DataFrame) -> pd.DataFrame:
    """Generate a missing-value report for all columns."""
    total = len(df)
    report = pd.DataFrame({
        "column": df.columns,
        "dtype": [str(df[c].dtype) for c in df.columns],
        "missing_count": [df[c].isna().sum() for c in df.columns],
        "missing_pct": [round(df[c].isna().mean() * 100, 2) for c in df.columns],
        "zero_count": [
            (df[c] == 0).sum() if pd.api.types.is_numeric_dtype(df[c]) else 0
            for c in df.columns
        ],
        "unique_count": [df[c].nunique() for c in df.columns],
    })
    report = report.sort_values("missing_pct", ascending=False)
    return report
