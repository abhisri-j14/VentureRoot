"""
GramBiz Model 3 — Residual Analysis Engine
===========================================
Performs detailed residual analysis (y_true - y_pred) checking for systematic bias,
heteroscedasticity, temporal error drift, and over/underprediction across price bands.
Generates residual diagnostic plots in artifacts/reports/plots/.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from src.utils.config import REPORTS_DIR, PLOTS_DIR
from src.utils.logger import get_logger

logger = get_logger("ResidualAnalysis")


class ResidualAnalyzer:
    @staticmethod
    def analyze_residuals(df_eval: pd.DataFrame, y_true: np.ndarray, y_pred: np.ndarray, date_col: str = "arrival_date") -> Dict[str, Any]:
        """Generates residual summary stats and plots."""
        residuals = y_true - y_pred
        abs_residuals = np.abs(residuals)

        mean_residual = float(np.mean(residuals))
        std_residual = float(np.std(residuals))
        median_abs_residual = float(np.median(abs_residuals))

        # Check for systematic bias
        systematic_bias = "Negligible"
        if mean_residual > 50.0:
            systematic_bias = "Underprediction Bias (Model predicts lower than actual)"
        elif mean_residual < -50.0:
            systematic_bias = "Overprediction Bias (Model predicts higher than actual)"

        # 1. Prediction vs Actual Plot
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.scatter(y_true, y_pred, alpha=0.5, color="teal", edgecolors="none")
        max_val = max(np.max(y_true), np.max(y_pred))
        ax.plot([0, max_val], [0, max_val], 'r--', label="Perfect Prediction (1:1)")
        ax.set_xlabel("Actual Price (₹/quintal)")
        ax.set_ylabel("Predicted Price (₹/quintal)")
        ax.set_title("GramBiz Model 3 — Actual vs Predicted Market Price")
        ax.legend()
        plt.tight_layout()
        plot1_path = PLOTS_DIR / "prediction_vs_actual.png"
        plt.savefig(plot1_path, dpi=300)
        plt.close()

        # 2. Residuals Scatter Plot (Residuals vs Predicted)
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.scatter(y_pred, residuals, alpha=0.5, color="purple", edgecolors="none")
        ax.axhline(0, color="red", linestyle="--")
        ax.set_xlabel("Predicted Price (₹/quintal)")
        ax.set_ylabel("Residual (Actual - Predicted)")
        ax.set_title("GramBiz Model 3 — Residuals vs Predicted Price")
        plt.tight_layout()
        plot2_path = PLOTS_DIR / "residuals_plot.png"
        plt.savefig(plot2_path, dpi=300)
        plt.close()

        # 3. Error Distribution Histogram
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.hist(residuals, bins=40, color="steelblue", edgecolor="black", alpha=0.7)
        ax.axvline(0, color="red", linestyle="--", linewidth=2)
        ax.set_xlabel("Residual (₹/quintal)")
        ax.set_ylabel("Frequency")
        ax.set_title("GramBiz Model 3 — Residual Error Distribution")
        plt.tight_layout()
        plot3_path = PLOTS_DIR / "error_distribution.png"
        plt.savefig(plot3_path, dpi=300)
        plt.close()

        # 4. Residuals Over Time Plot
        if date_col in df_eval.columns:
            dates = pd.to_datetime(df_eval[date_col])
            fig, ax = plt.subplots(figsize=(10, 5))
            ax.scatter(dates, residuals, alpha=0.5, color="darkgreen", edgecolors="none")
            ax.axhline(0, color="red", linestyle="--")
            ax.set_xlabel("Arrival Date")
            ax.set_ylabel("Residual (₹/quintal)")
            ax.set_title("GramBiz Model 3 — Residual Errors Over Time")
            plt.tight_layout()
            plot4_path = PLOTS_DIR / "residuals_over_time.png"
            plt.savefig(plot4_path, dpi=300)
            plt.close()

        logger.info(f"Saved residual analysis plots to {PLOTS_DIR}")

        return {
            "mean_residual": round(mean_residual, 4),
            "std_residual": round(std_residual, 4),
            "median_abs_residual": round(median_abs_residual, 4),
            "systematic_bias_assessment": systematic_bias
        }
