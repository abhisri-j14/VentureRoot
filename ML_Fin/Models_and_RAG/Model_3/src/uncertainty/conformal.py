"""
GramBiz Model 3 — Conformal Prediction Interval Engine
======================================================
Implements split conformal prediction to generate 90% empirical prediction intervals.
Features:
- Calibrated strictly on Validation set (never on test set).
- Non-negative lower bound: lower = max(0, prediction - q).
- Evaluates empirical holdout coverage, coverage error, mean/median width, and commodity/price band coverage.
- Outputs artifacts/reports/conformal_coverage_report.json, conformal_coverage_by_commodity.csv, and conformal_coverage.png plot.
"""

import json
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from src.utils.config import REPORTS_DIR, PLOTS_DIR
from src.utils.logger import get_logger

logger = get_logger("ConformalPredictor")


class ConformalPredictor:
    def __init__(self, alpha: float = 0.10):
        self.alpha = alpha  # Nominal 90% coverage
        self.q_hat = None

    def calibrate(self, y_val: np.ndarray, y_val_pred: np.ndarray):
        """Calibrates conformal quantile residual q_hat strictly on validation set."""
        residuals = np.abs(y_val - y_val_pred)
        n = len(residuals)
        if n == 0:
            self.q_hat = 100.0
            return

        # Conformal quantile level: (1 - alpha) * (1 + 1/n)
        q_level = np.ceil((1.0 - self.alpha) * (n + 1)) / n
        q_level = min(1.0, max(0.0, q_level))
        self.q_hat = float(np.quantile(residuals, q_level))
        logger.info(f"Calibrated Conformal q_hat strictly on Val set: {self.q_hat:.2f} ₹/quintal (Target Coverage: {int((1-self.alpha)*100)}%)")

    def predict_interval(self, y_pred: float) -> Dict[str, Any]:
        """Generates lower, upper prediction bounds and recommended selling price."""
        q = self.q_hat if self.q_hat is not None else max(10.0, y_pred * 0.05)

        # Enforce non-negative lower price bound
        lower = max(0.0, round(y_pred - q, 2))
        upper = round(y_pred + q, 2)
        expected = round(y_pred, 2)

        # Reference Selling Price (forecast + volatility buffer)
        ref_selling_price = round(expected + 0.1 * q, 2)

        return {
            "expected_market_price": expected,
            "lower_price_bound": lower,
            "upper_price_bound": upper,
            "recommended_selling_price": ref_selling_price,
            "prediction_interval_width": round(upper - lower, 2),
            "confidence_coverage_target": f"{int((1 - self.alpha) * 100)}%",
            "conformal_quantile_qhat": round(q, 2)
        }

    def evaluate_test_coverage(self, test_df: pd.DataFrame, y_test: np.ndarray, y_test_pred: np.ndarray) -> Dict[str, Any]:
        """Evaluates empirical coverage on untouched final holdout test set."""
        q = self.q_hat if self.q_hat is not None else 100.0

        lowers = np.maximum(0.0, y_test_pred - q)
        uppers = y_test_pred + q
        widths = uppers - lowers

        # Check empirical coverage boolean (lowers <= y_test <= uppers)
        covered = (y_test >= lowers) & (y_test <= uppers)
        empirical_coverage = float(np.mean(covered))
        nominal_coverage = 1.0 - self.alpha
        coverage_error = float(empirical_coverage - nominal_coverage)

        mean_width = float(np.mean(widths))
        median_width = float(np.median(widths))

        # Coverage by Commodity
        test_df_tmp = test_df.copy()
        test_df_tmp["covered"] = covered
        test_df_tmp["width"] = widths

        comm_rows = []
        for comm, grp in test_df_tmp.groupby("commodity"):
            comm_rows.append({
                "commodity": comm,
                "sample_count": len(grp),
                "empirical_coverage": round(float(grp["covered"].mean()), 4),
                "mean_interval_width": round(float(grp["width"].mean()), 2)
            })
        comm_df = pd.DataFrame(comm_rows)
        comm_df.to_csv(REPORTS_DIR / "conformal_coverage_by_commodity.csv", index=False)

        # Plot Coverage by Commodity vs Nominal
        plt.figure(figsize=(10, 5))
        plt.bar(comm_df["commodity"], comm_df["empirical_coverage"] * 100, color="teal", edgecolor="black", alpha=0.8)
        plt.axhline(nominal_coverage * 100, color="red", linestyle="--", linewidth=2, label="Nominal 90% Target")
        plt.ylabel("Empirical Coverage (%)")
        plt.title("GramBiz Model 3 — Empirical Conformal Coverage by Commodity")
        plt.legend()
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / "conformal_coverage.png", dpi=300)
        plt.close()

        report = {
            "nominal_coverage": round(nominal_coverage, 4),
            "empirical_holdout_coverage": round(empirical_coverage, 4),
            "coverage_error": round(coverage_error, 4),
            "mean_interval_width_rs_per_quintal": round(mean_width, 2),
            "median_interval_width_rs_per_quintal": round(median_width, 2),
            "conformal_qhat": round(q, 2),
            "conformal_integrity_status": "PASSED" if abs(coverage_error) <= 0.08 else "WARN"
        }

        with open(REPORTS_DIR / "conformal_coverage_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        logger.info(f"Evaluated Conformal Coverage on Holdout Test Set: Empirical={empirical_coverage*100:.2f}% (Nominal={nominal_coverage*100:.0f}%)")
        return report
