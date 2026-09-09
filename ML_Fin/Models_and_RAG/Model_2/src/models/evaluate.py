"""
GramBiz Model 2 -- Evaluation & Diagnostics
=============================================
Calculates MAE, RMSE, R², Median AE, Spearman Rank Correlation,
and generates diagnostic plots saved to artifacts/reports/plots/.
"""

import logging
import os
from typing import Any, Dict, List, Optional

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy import stats as sp_stats
from sklearn.metrics import mean_absolute_error, mean_squared_error, median_absolute_error, r2_score

from src.config import PLOTS_DIR

logger = logging.getLogger(__name__)


def calculate_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Calculate all evaluation metrics."""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    med_ae = median_absolute_error(y_true, y_pred)
    spearman, spearman_p = sp_stats.spearmanr(y_true, y_pred)

    return {
        "mae": round(float(mae), 4),
        "rmse": round(float(rmse), 4),
        "r2": round(float(r2), 4),
        "median_ae": round(float(med_ae), 4),
        "spearman_rank": round(float(spearman), 4),
        "spearman_p_value": round(float(spearman_p), 6),
    }


def generate_evaluation_plots(
    y_holdout: np.ndarray,
    y_pred_holdout: np.ndarray,
    comparison_df: pd.DataFrame,
    output_dir: Optional[str] = None,
) -> Dict[str, str]:
    """Generate diagnostic plots and save to artifacts/reports/plots/."""
    out_dir = output_dir or PLOTS_DIR
    os.makedirs(out_dir, exist_ok=True)
    saved_plots = {}

    # 1. Holdout Actual vs Predicted Scatter Plot
    plt.figure(figsize=(7, 5))
    plt.scatter(y_holdout, y_pred_holdout, alpha=0.6, color="#166534", edgecolors="none", s=25)
    plt.plot([y_holdout.min(), y_holdout.max()], [y_holdout.min(), y_holdout.max()], "r--", lw=2, label="Ideal Fit")
    plt.title("Holdout: Actual vs Predicted Viability Score", fontsize=12, fontweight="bold")
    plt.xlabel("Actual Viability Score")
    plt.ylabel("Predicted Viability Score")
    plt.legend()
    plt.tight_layout()
    p1 = os.path.join(out_dir, "actual_vs_predicted.png")
    plt.savefig(p1, dpi=200)
    plt.close()
    saved_plots["actual_vs_predicted"] = p1

    # 2. Residual Plot
    residuals = y_holdout - y_pred_holdout
    plt.figure(figsize=(7, 5))
    plt.scatter(y_pred_holdout, residuals, alpha=0.6, color="#2563eb", edgecolors="none", s=25)
    plt.axhline(0, color="r", linestyle="--", lw=2)
    plt.title("Holdout Residual Plot", fontsize=12, fontweight="bold")
    plt.xlabel("Predicted Viability Score")
    plt.ylabel("Residual (Actual - Predicted)")
    plt.tight_layout()
    p2 = os.path.join(out_dir, "residual_plot.png")
    plt.savefig(p2, dpi=200)
    plt.close()
    saved_plots["residual_plot"] = p2

    # 3. Model Comparison Bar Chart
    if not comparison_df.empty:
        plt.figure(figsize=(8, 5))
        df_sorted = comparison_df.sort_values("gkf_mae_mean")
        plt.barh(df_sorted["model"], df_sorted["gkf_mae_mean"], color="#3b82f6", edgecolor="#1e40af")
        plt.title("GroupKFold Cross-Validation Mean MAE by Model", fontsize=12, fontweight="bold")
        plt.xlabel("GroupKFold MAE (Lower is better)")
        plt.gca().invert_yaxis()
        plt.tight_layout()
        p3 = os.path.join(out_dir, "model_comparison.png")
        plt.savefig(p3, dpi=200)
        plt.close()
        saved_plots["model_comparison"] = p3

    logger.info(f"Diagnostic plots generated at {out_dir}")
    return saved_plots
