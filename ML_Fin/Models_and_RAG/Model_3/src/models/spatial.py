"""
GramBiz Model 3 — Spatial GroupKFold Validation Engine
======================================================
Evaluates geographic generalization robustness across unobserved districts
using GroupKFold grouped strictly by district.
Ensures zero overlap: set(train_groups) ∩ set(val_groups) == empty.
Generates artifacts/reports/spatial_validation.csv.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple
from sklearn.model_selection import GroupKFold

from src.utils.config import REPORTS_DIR, RANDOM_SEED
from src.models.baselines import compute_regression_metrics
from src.utils.logger import get_logger

logger = get_logger("SpatialGroupValidation")


class SpatialGroupValidator:
    @staticmethod
    def run_spatial_cv(
        df: pd.DataFrame,
        model_factory_fn,
        feature_cols: List[str],
        group_col: str = "district",
        target_col: str = "normalized_price",
        n_splits: int = 5
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Executes GroupKFold Spatial Cross Validation grouped by district."""
        df_clean = df.dropna(subset=[group_col, target_col]).copy()
        groups = df_clean[group_col].values

        gkf = GroupKFold(n_splits=n_splits)

        results = []

        for fold_idx, (train_idx, val_idx) in enumerate(gkf.split(df_clean, df_clean[target_col], groups=groups), 1):
            train_df = df_clean.iloc[train_idx]
            val_df = df_clean.iloc[val_idx]

            # Enforce Group Disjointness Assertion
            train_groups = set(train_df[group_col].unique())
            val_groups = set(val_df[group_col].unique())
            overlap = train_groups.intersection(val_groups)

            assert len(overlap) == 0, f"SPATIAL LEAKAGE DETECTED! Overlapping district groups found: {overlap}"

            X_train = train_df[feature_cols].fillna(train_df[feature_cols].median())
            y_train = train_df[target_col].values

            X_val = val_df[feature_cols].fillna(train_df[feature_cols].median())
            y_val = val_df[target_col].values

            model = model_factory_fn()
            model.fit(X_train, y_train)
            val_preds = model.predict(X_val)

            metrics = compute_regression_metrics(y_val, val_preds)
            metrics["fold"] = fold_idx
            metrics["group_column"] = group_col
            metrics["train_districts_count"] = len(train_groups)
            metrics["val_districts_count"] = len(val_groups)
            metrics["group_overlap_count"] = len(overlap)

            results.append(metrics)
            logger.info(f"Spatial Fold {fold_idx}/{n_splits} ({group_col}): Train Dist={len(train_groups)}, Val Dist={len(val_groups)} | MAE={metrics['mae']:.2f}, R2={metrics['r2']:.4f}")

        res_df = pd.DataFrame(results)
        res_df.to_csv(REPORTS_DIR / "spatial_validation.csv", index=False)

        summary = {
            "group_column": group_col,
            "mean_spatial_mae": float(res_df["mae"].mean()),
            "std_spatial_mae": float(res_df["mae"].std()),
            "mean_spatial_r2": float(res_df["r2"].mean()),
            "mean_spatial_wape": float(res_df["wape"].mean()),
            "folds_evaluated": len(res_df),
            "disjointness_passed": True
        }
        return res_df, summary
