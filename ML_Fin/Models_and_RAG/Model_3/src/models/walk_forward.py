"""
GramBiz Model 3 — Walk-Forward Expanding-Window Validation Engine
====================================================================
Evaluates model performance across expanding temporal folds to guarantee
out-of-sample generalization across time without lookahead bias.
Generates artifacts/reports/walk_forward_results.csv and performance plot.
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from src.utils.config import REPORTS_DIR, PLOTS_DIR, RANDOM_SEED
from src.models.baselines import compute_regression_metrics
from src.utils.logger import get_logger

logger = get_logger("WalkForwardValidation")


class WalkForwardValidator:
    @staticmethod
    def run_walk_forward(
        df: pd.DataFrame,
        model_factory_fn,
        feature_cols: List[str],
        target_col: str = "normalized_price",
        date_col: str = "arrival_date",
        n_folds: int = 4
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Executes expanding window walk-forward temporal cross-validation."""
        df_sorted = df.copy()
        df_sorted[date_col] = pd.to_datetime(df_sorted[date_col])
        df_sorted = df_sorted.sort_values(by=date_col).reset_index(drop=True)

        n_samples = len(df_sorted)
        fold_size = n_samples // (n_folds + 1)

        results = []

        for fold_idx in range(1, n_folds + 1):
            train_end = fold_size * (fold_idx + 1)
            val_end = min(n_samples, train_end + fold_size)

            train_fold = df_sorted.iloc[:train_end].copy()
            val_fold = df_sorted.iloc[train_end:val_end].copy()

            if len(val_fold) == 0:
                continue

            X_train = train_fold[feature_cols].fillna(train_fold[feature_cols].median())
            y_train = train_fold[target_col].values

            X_val = val_fold[feature_cols].fillna(train_fold[feature_cols].median())
            y_val = val_fold[target_col].values

            model = model_factory_fn()
            model.fit(X_train, y_train)
            val_preds = model.predict(X_val)

            metrics = compute_regression_metrics(y_val, val_preds)
            metrics["fold"] = fold_idx
            metrics["train_start"] = train_fold[date_col].min().strftime("%Y-%m-%d")
            metrics["train_end"] = train_fold[date_col].max().strftime("%Y-%m-%d")
            metrics["val_start"] = val_fold[date_col].min().strftime("%Y-%m-%d")
            metrics["val_end"] = val_fold[date_col].max().strftime("%Y-%m-%d")
            metrics["train_size"] = len(train_fold)
            metrics["val_size"] = len(val_fold)

            results.append(metrics)
            logger.info(f"Walk-Forward Fold {fold_idx}/{n_folds}: Train={len(train_fold)}, Val={len(val_fold)} | MAE={metrics['mae']:.2f}, R2={metrics['r2']:.4f}")

        res_df = pd.DataFrame(results)
        res_df.to_csv(REPORTS_DIR / "walk_forward_results.csv", index=False)

        # Plot Walk-Forward Performance Across Folds
        fig, ax1 = plt.subplots(figsize=(10, 5))
        color = "tab:blue"
        ax1.set_xlabel("Walk-Forward Fold")
        ax1.set_ylabel("MAE (₹/quintal)", color=color)
        ax1.plot(res_df["fold"], res_df["mae"], marker="o", color=color, linewidth=2, label="MAE")
        ax1.tick_params(axis="y", labelcolor=color)

        ax2 = ax1.twinx()
        color = "tab:orange"
        ax2.set_ylabel("R² Score", color=color)
        ax2.plot(res_df["fold"], res_df["r2"], marker="s", color=color, linestyle="--", linewidth=2, label="R²")
        ax2.tick_params(axis="y", labelcolor=color)

        plt.title("GramBiz Model 3 — Walk-Forward Temporal Generalization")
        fig.tight_layout()
        plot_path = PLOTS_DIR / "walk_forward_performance.png"
        plt.savefig(plot_path, dpi=300)
        plt.close()
        logger.info(f"Saved walk-forward performance plot to {plot_path}")

        summary = {
            "mean_mae": float(res_df["mae"].mean()),
            "std_mae": float(res_df["mae"].std()),
            "mean_r2": float(res_df["r2"].mean()),
            "mean_wape": float(res_df["wape"].mean()),
            "folds_evaluated": len(res_df)
        }
        return res_df, summary
