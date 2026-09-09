"""
GramBiz Model 3 — Data Drift & Model Stability Audit Engine
============================================================
1. Temporal Drift Monitoring: Compares feature & target distributions across
   Train -> Val, Val -> Test, and Train -> Test splits.
   Generates artifacts/reports/drift_report.json and feature_drift.png plot.
2. Multi-Seed Model Stability Audit: Evaluates pipeline performance across
   random seeds (42, 123, 2024). Generates artifacts/reports/model_stability_report.json.
"""

import json
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Tuple
from scipy.stats import ks_2samp
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from src.utils.config import REPORTS_DIR, PLOTS_DIR, RANDOM_SEED
from src.models.baselines import compute_regression_metrics
from src.utils.logger import get_logger

logger = get_logger("QualityDriftStabilityAudit")


class DriftAndStabilityAuditor:
    @staticmethod
    def audit_temporal_drift(
        train_df: pd.DataFrame,
        val_df: pd.DataFrame,
        test_df: pd.DataFrame,
        feature_cols: List[str],
        target_col: str = "normalized_price"
    ) -> Dict[str, Any]:
        """Audits feature & target drift using Kolmogorov-Smirnov 2-sample tests."""
        drift_results = []
        high_drift_count = 0

        eval_cols = feature_cols + [target_col]

        for col in eval_cols:
            if col not in train_df.columns or col not in val_df.columns or col not in test_df.columns:
                continue

            train_vals = train_df[col].dropna().values
            val_vals = val_df[col].dropna().values
            test_vals = test_df[col].dropna().values

            if len(train_vals) == 0 or len(val_vals) == 0 or len(test_vals) == 0:
                continue

            # KS-test train vs val
            ks_tv, p_tv = ks_2samp(train_vals, val_vals)
            # KS-test train vs test
            ks_tt, p_tt = ks_2samp(train_vals, test_vals)

            # Drift Severity: LOW (p > 0.05), MODERATE (0.01 <= p <= 0.05), HIGH (p < 0.01)
            severity = "LOW"
            if p_tt < 0.01:
                severity = "HIGH"
                high_drift_count += 1
            elif p_tt <= 0.05:
                severity = "MODERATE"

            drift_results.append({
                "column": col,
                "ks_train_vs_val": round(float(ks_tv), 4),
                "p_train_vs_val": round(float(p_tv), 4),
                "ks_train_vs_test": round(float(ks_tt), 4),
                "p_train_vs_test": round(float(p_tt), 4),
                "drift_severity": severity
            })

        drift_status = "LOW"
        if high_drift_count > 3:
            drift_status = "HIGH"
        elif high_drift_count > 0:
            drift_status = "MODERATE"

        report = {
            "overall_drift_status": drift_status,
            "high_drift_features_count": high_drift_count,
            "evaluated_columns_count": len(drift_results),
            "column_drift_details": drift_results
        }

        with open(REPORTS_DIR / "drift_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        # Plot Feature Drift KS statistics
        drift_df = pd.DataFrame(drift_results).sort_values(by="ks_train_vs_test", ascending=False).head(10)
        plt.figure(figsize=(10, 5))
        plt.bar(drift_df["column"], drift_df["ks_train_vs_test"], color="indianred", edgecolor="black")
        plt.xticks(rotation=45, ha="right")
        plt.ylabel("KS Statistic (Train vs Test)")
        plt.title("GramBiz Model 3 — Top Feature Drift (KS Statistic)")
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / "feature_drift.png", dpi=300)
        plt.close()

        logger.info(f"Saved temporal drift report to {REPORTS_DIR / 'drift_report.json'}")
        return report

    @staticmethod
    def audit_model_stability(
        model_factory_fn,
        X_train: pd.DataFrame,
        y_train: np.ndarray,
        X_val: pd.DataFrame,
        y_val: np.ndarray,
        seeds: List[int] = [42, 123, 2024]
    ) -> Dict[str, Any]:
        """Evaluates pipeline performance stability across multiple random seeds."""
        seed_metrics = []

        for seed in seeds:
            model = model_factory_fn(seed)
            model.fit(X_train, y_train)
            val_preds = model.predict(X_val)

            m = compute_regression_metrics(y_val, val_preds)
            m["seed"] = seed
            seed_metrics.append(m)

        mae_vals = [m["mae"] for m in seed_metrics]
        r2_vals = [m["r2"] for m in seed_metrics]

        mean_mae = float(np.mean(mae_vals))
        std_mae = float(np.std(mae_vals))
        mean_r2 = float(np.mean(r2_vals))
        std_r2 = float(np.std(r2_vals))

        stability_status = "STABLE"
        if std_mae > 50.0 or std_r2 > 0.05:
            stability_status = "UNSTABLE"

        report = {
            "stability_status": stability_status,
            "seeds_evaluated": seeds,
            "mean_mae": round(mean_mae, 4),
            "std_mae": round(std_mae, 4),
            "mean_r2": round(mean_r2, 4),
            "std_r2": round(std_r2, 4),
            "per_seed_results": seed_metrics
        }

        with open(REPORTS_DIR / "model_stability_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        logger.info(f"Saved model stability report to {REPORTS_DIR / 'model_stability_report.json'}")
        return report
