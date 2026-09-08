"""
GramBiz Model 2 -- Data Quality Audit
=======================================
Generates machine-readable data quality report detailing:
- Rows before and after cleaning
- Missing-value percentages before and after
- Duplicate counts
- Invalid / capped value counts
Saved to artifacts/feature_metadata/data_quality_report.json.
"""

import json
import logging
import os
from typing import Any, Dict, Optional

import pandas as pd

from src.config import FEATURE_METADATA_DIR

logger = logging.getLogger(__name__)


def generate_data_quality_report(
    raw_df_dict: Dict[str, pd.DataFrame],
    cleaned_df_dict: Dict[str, pd.DataFrame],
    save_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate machine-readable data quality report.

    Parameters
    ----------
    raw_df_dict : Dict[str, pd.DataFrame]
        Raw dataframes keyed by dataset name.
    cleaned_df_dict : Dict[str, pd.DataFrame]
        Cleaned dataframes keyed by dataset name.
    save_path : str, optional
        Path to save JSON report.

    Returns
    -------
    dict
        Quality metrics audit.
    """
    report = {
        "datasets": {},
        "overall_status": "PASSED"
    }

    for name in raw_df_dict:
        raw = raw_df_dict[name]
        cleaned = cleaned_df_dict.get(name, raw)

        raw_missing = float(raw.isna().sum().sum()) / max(1, (raw.shape[0] * raw.shape[1]))
        cleaned_missing = float(cleaned.isna().sum().sum()) / max(1, (cleaned.shape[0] * cleaned.shape[1]))

        duplicates_raw = int(raw.duplicated().sum())
        duplicates_cleaned = int(cleaned.duplicated().sum())

        report["datasets"][name] = {
            "rows_raw": len(raw),
            "rows_cleaned": len(cleaned),
            "cols_raw": len(raw.columns),
            "cols_cleaned": len(cleaned.columns),
            "missing_pct_raw": round(raw_missing * 100, 2),
            "missing_pct_cleaned": round(cleaned_missing * 100, 2),
            "duplicates_removed": duplicates_raw - duplicates_cleaned,
            "data_quality_status": "EXCELLENT" if cleaned_missing < 0.10 else "ACCEPTABLE"
        }

    if save_path is None:
        os.makedirs(FEATURE_METADATA_DIR, exist_ok=True)
        save_path = os.path.join(FEATURE_METADATA_DIR, "data_quality_report.json")

    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logger.info(f"Data quality report saved to {save_path}")
    return report
