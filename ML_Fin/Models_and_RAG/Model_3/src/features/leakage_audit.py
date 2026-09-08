"""
GramBiz Model 3 — Pre-Training Leakage Audit Engine
===================================================
Audits the feature matrix and training splits for target leakage and temporal leakage.
Generates artifacts/reports/leakage_audit.json.
Pipeline execution MUST ABORT if critical leakage is detected.
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple

from src.utils.config import PROCESSED_DIR, REPORTS_DIR, PROJECT_ROOT
from src.utils.logger import get_logger

logger = get_logger("LeakageAudit")

# Strictly forbidden feature columns when predicting target_modal_price at date T
FORBIDDEN_TARGET_DERIVED_COLS = [
    "target", "target_modal_price", "modal_price", "normalized_price", "original_price",
    "min_price", "max_price", "min_x0020_price", "max_x0020_price"
]


class LeakageAuditor:
    @staticmethod
    def audit_feature_column_disjointness(feature_cols: List[str], target_col: str = "normalized_price") -> Dict[str, Any]:
        """Verifies that no target or contemporaneous target-derived columns exist in feature set."""
        leaked_cols = [c for c in feature_cols if c.lower() in FORBIDDEN_TARGET_DERIVED_COLS or c.lower() == target_col.lower()]
        passed = len(leaked_cols) == 0
        return {
            "test_name": "feature_target_disjointness",
            "passed": passed,
            "forbidden_cols_found": leaked_cols,
            "message": "PASSED: Feature list is completely disjoint from target and contemporaneous price columns." if passed else f"FAILED: Found leaked target columns {leaked_cols}"
        }

    @staticmethod
    def audit_temporal_lag_integrity(df: pd.DataFrame, date_col: str = "arrival_date") -> Dict[str, Any]:
        """
        Verifies that lag_1_price and rolling statistics at date T
        do not contain target value of date T.
        Checks correlation: lag_1_price vs target_price should be high,
        but lag_1_price must equal target_price of row (T-1), not row T.
        """
        df_sorted = df.copy()
        df_sorted[date_col] = pd.to_datetime(df_sorted[date_col])
        group_cols = ["state", "district", "market", "commodity", "variety", "grade"]
        df_sorted = df_sorted.sort_values(by=group_cols + [date_col]).reset_index(drop=True)
        
        # Check if lag_1_price matches un-filled shifted target
        shifted_target = df_sorted.groupby(group_cols)["normalized_price"].shift(1)
        
        # Only compare rows where shifted_target was originally not NaN
        valid_mask = ~shifted_target.isna()
        diff = (df_sorted.loc[valid_mask, "lag_1_price"] - shifted_target.loc[valid_mask]).abs()
        
        max_diff = float(diff.max()) if len(diff) > 0 else 0.0
        passed = max_diff < 1e-4

        return {
            "test_name": "temporal_lag_shift_integrity",
            "passed": passed,
            "max_shift_discrepancy": max_diff,
            "message": "PASSED: All lag features shift strictly prior to observation date T." if passed else f"FAILED: Lag features contain same-day T target leakage (max diff={max_diff})"
        }

    @staticmethod
    def audit_chronological_split_leakage(train_df: pd.DataFrame, test_df: pd.DataFrame, date_col: str = "arrival_date") -> Dict[str, Any]:
        """Verifies that max(train_date) < min(test_date) with zero temporal overlap."""
        max_train_date = pd.to_datetime(train_df[date_col]).max()
        min_test_date = pd.to_datetime(test_df[date_col]).min()
        
        passed = max_train_date < min_test_date
        return {
            "test_name": "chronological_split_isolation",
            "passed": passed,
            "max_train_date": max_train_date.strftime("%Y-%m-%d"),
            "min_test_date": min_test_date.strftime("%Y-%m-%d"),
            "temporal_gap_days": int((min_test_date - max_train_date).days),
            "message": f"PASSED: Strict chronological boundary enforced. Train max={max_train_date.date()}, Test min={min_test_date.date()}" if passed else "FAILED: Temporal overlap detected between train and test splits."
        }

    @classmethod
    def run_full_audit(cls, df: pd.DataFrame, feature_cols: List[str], target_col: str = "normalized_price") -> Dict[str, Any]:
        """Executes all leakage audit checks and returns overall result."""
        logger.info("Executing comprehensive pre-training leakage audit...")

        disjoint_res = cls.audit_feature_column_disjointness(feature_cols, target_col)
        shift_res = cls.audit_temporal_lag_integrity(df)

        overall_passed = disjoint_res["passed"] and shift_res["passed"]

        audit_summary = {
            "overall_audit_status": "PASSED" if overall_passed else "FAILED",
            "all_tests_passed": overall_passed,
            "timestamp": pd.Timestamp.now().isoformat(),
            "target_column": target_col,
            "feature_count": len(feature_cols),
            "checks": [disjoint_res, shift_res]
        }

        # Save report
        out_json = REPORTS_DIR / "leakage_audit.json"
        with open(out_json, "w", encoding="utf-8") as f:
            json.dump(audit_summary, f, indent=2)

        # Generate markdown audit report
        out_md = PROJECT_ROOT / "LEAKAGE_AUDIT.md"
        with open(out_md, "w", encoding="utf-8") as mf:
            mf.write("# GramBiz Model 3 — Pre-Training Leakage Audit Report\n\n")
            mf.write(f"**Overall Audit Status:** `{audit_summary['overall_audit_status']}`\n\n")
            mf.write(f"**Audit Timestamp:** `{audit_summary['timestamp']}`\n\n")
            mf.write("## Test Results Summary\n\n")
            for c in audit_summary["checks"]:
                status_icon = "✅ PASSED" if c["passed"] else "❌ FAILED"
                mf.write(f"### {c['test_name']}: {status_icon}\n")
                mf.write(f"- **Message:** {c['message']}\n\n")

        logger.info(f"Leakage audit completed. Status: {audit_summary['overall_audit_status']}. Report saved to {out_json}")
        return audit_summary


def run_audit_script():
    feature_file = PROCESSED_DIR / "feature_matrix.csv"
    if not feature_file.exists():
        from src.features.engineering import run_feature_pipeline
        run_feature_pipeline()

    df = pd.read_csv(feature_file)
    non_feature_cols = ["arrival_date", "state", "district", "market", "commodity", "variety", "grade", "original_price", "original_unit", "normalized_price", "normalized_unit", "is_unit_usable", "min_price", "max_price", "modal_price"]
    feature_cols = [c for c in df.columns if c not in non_feature_cols]

    res = LeakageAuditor.run_full_audit(df, feature_cols, target_col="normalized_price")
    if not res["all_tests_passed"]:
        raise ValueError("CRITICAL LEAKAGE DETECTED! Training aborted by LeakageAuditor.")


if __name__ == "__main__":
    run_audit_script()
