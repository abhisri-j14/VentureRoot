"""
GramBiz Model 1 -- Model Evaluation & Diagnostics
====================================================
Generate learning curves, feature importance, residual plots,
and model comparison reports.
"""

import logging
import os
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import learning_curve, GroupKFold
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

from src.models.train import compute_metrics

logger = logging.getLogger(__name__)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VIZ_DIR = os.path.join(BASE_DIR, "reports", "model_diagnostics")


def generate_learning_curve(
    model: Any,
    X: np.ndarray,
    y: np.ndarray,
    groups: Optional[np.ndarray] = None,
    n_folds: int = 5,
    save_path: Optional[str] = None,
) -> None:
    """Generate and save learning curve plot."""
    os.makedirs(VIZ_DIR, exist_ok=True)

    cv = GroupKFold(n_splits=n_folds) if groups is not None else n_folds
    
    # pyrefly: ignore [bad-unpacking]
    train_sizes, train_scores, val_scores = learning_curve(
        model, X, y,
        cv=cv, groups=groups,
        train_sizes=np.linspace(0.1, 1.0, 10),
        scoring="neg_mean_absolute_error",
        n_jobs=-1,
    )

    train_mean = -train_scores.mean(axis=1)
    val_mean = -val_scores.mean(axis=1)
    train_std = train_scores.std(axis=1)
    val_std = val_scores.std(axis=1)

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1, color="blue")
    ax.fill_between(train_sizes, val_mean - val_std, val_mean + val_std, alpha=0.1, color="orange")
    ax.plot(train_sizes, train_mean, "o-", color="blue", label="Training MAE")
    ax.plot(train_sizes, val_mean, "o-", color="orange", label="Validation MAE")
    ax.set_xlabel("Training Set Size", fontsize=12)
    ax.set_ylabel("Mean Absolute Error", fontsize=12)
    ax.set_title("Learning Curve - GramBiz Model 1", fontsize=14)
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)

    path = save_path or os.path.join(VIZ_DIR, "learning_curve.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info(f"Learning curve saved: {path}")


def generate_feature_importance(
    model: Any,
    feature_names: List[str],
    save_path: Optional[str] = None,
    top_n: int = 20,
) -> pd.DataFrame:
    """Generate feature importance plot and return importance DataFrame."""
    os.makedirs(VIZ_DIR, exist_ok=True)

    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "coef_"):
        importances = np.abs(model.coef_)
    else:
        logger.warning("Model does not have feature_importances_ or coef_")
        return pd.DataFrame()

    imp_df = pd.DataFrame({
        "feature": feature_names,
        "importance": importances,
    }).sort_values("importance", ascending=False)

    # Plot top N
    plot_df = imp_df.head(top_n)
    fig, ax = plt.subplots(figsize=(10, 8))
    ax.barh(range(len(plot_df)), plot_df["importance"].values, color="#3B82F6")
    ax.set_yticks(range(len(plot_df)))
    ax.set_yticklabels(plot_df["feature"].values)
    ax.invert_yaxis()
    ax.set_xlabel("Feature Importance", fontsize=12)
    ax.set_title(f"Top {top_n} Feature Importances - GramBiz Model 1", fontsize=14)
    ax.grid(True, alpha=0.3, axis="x")

    path = save_path or os.path.join(VIZ_DIR, "feature_importance.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info(f"Feature importance saved: {path}")

    return imp_df


def generate_prediction_vs_actual(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    label: str = "Holdout",
    save_path: Optional[str] = None,
) -> None:
    """Generate prediction vs actual scatter plot."""
    os.makedirs(VIZ_DIR, exist_ok=True)

    fig, ax = plt.subplots(figsize=(8, 8))
    ax.scatter(y_true, y_pred, alpha=0.4, s=10, color="#3B82F6")
    lims = [min(y_true.min(), y_pred.min()) - 5, max(y_true.max(), y_pred.max()) + 5]
    ax.plot(lims, lims, "--", color="red", alpha=0.7, label="Perfect prediction")
    ax.set_xlabel(f"Actual MPI ({label})", fontsize=12)
    ax.set_ylabel(f"Predicted MPI ({label})", fontsize=12)
    ax.set_title(f"Predicted vs Actual - {label} Set", fontsize=14)
    ax.legend()
    ax.grid(True, alpha=0.3)

    path = save_path or os.path.join(VIZ_DIR, f"prediction_vs_actual_{label.lower()}.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info(f"Pred vs actual saved: {path}")


def generate_residual_plot(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    label: str = "Holdout",
    save_path: Optional[str] = None,
) -> None:
    """Generate residual distribution plot."""
    os.makedirs(VIZ_DIR, exist_ok=True)
    residuals = y_true - y_pred

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    # Residual scatter
    axes[0].scatter(y_pred, residuals, alpha=0.4, s=10, color="#3B82F6")
    axes[0].axhline(y=0, color="red", linestyle="--", alpha=0.7)
    axes[0].set_xlabel("Predicted MPI", fontsize=12)
    axes[0].set_ylabel("Residual", fontsize=12)
    axes[0].set_title(f"Residuals vs Predicted ({label})", fontsize=14)
    axes[0].grid(True, alpha=0.3)

    # Residual histogram
    axes[1].hist(residuals, bins=50, color="#3B82F6", alpha=0.7, edgecolor="white")
    axes[1].axvline(x=0, color="red", linestyle="--", alpha=0.7)
    axes[1].set_xlabel("Residual", fontsize=12)
    axes[1].set_ylabel("Count", fontsize=12)
    axes[1].set_title(f"Residual Distribution ({label})", fontsize=14)
    axes[1].grid(True, alpha=0.3)

    fig.tight_layout()
    path = save_path or os.path.join(VIZ_DIR, f"residual_plot_{label.lower()}.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info(f"Residual plot saved: {path}")


def generate_cv_scores_plot(
    comparison_df: pd.DataFrame,
    save_path: Optional[str] = None,
) -> None:
    """Generate CV scores comparison bar chart."""
    os.makedirs(VIZ_DIR, exist_ok=True)

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    # MAE comparison
    models = comparison_df["model"].values
    x = range(len(models))
    axes[0].bar(x, comparison_df["gkf_mae_mean"].values, yerr=comparison_df["gkf_mae_std"].values,
                color="#3B82F6", alpha=0.8, capsize=4)
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(models, rotation=45, ha="right")
    axes[0].set_ylabel("MAE (GroupKFold)", fontsize=12)
    axes[0].set_title("Cross-Validation MAE by Model", fontsize=14)
    axes[0].grid(True, alpha=0.3, axis="y")

    # Spearman comparison
    axes[1].bar(x, comparison_df["gkf_spearman_mean"].values,
                color="#10B981", alpha=0.8)
    axes[1].set_xticks(x)
    axes[1].set_xticklabels(models, rotation=45, ha="right")
    axes[1].set_ylabel("Spearman Rank Correlation (GroupKFold)", fontsize=12)
    axes[1].set_title("Ranking Quality by Model", fontsize=14)
    axes[1].grid(True, alpha=0.3, axis="y")

    fig.tight_layout()
    path = save_path or os.path.join(VIZ_DIR, "cv_scores.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info(f"CV scores plot saved: {path}")
