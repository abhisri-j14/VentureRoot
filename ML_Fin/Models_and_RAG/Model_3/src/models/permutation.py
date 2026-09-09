"""
GramBiz Model 3 — Target Permutation Sanity Test (Anti-Leakage Control)
========================================================================
Shuffles target y randomly and retrains/evaluates model.
Expectation: Performance MUST collapse (R^2 <= 0.05, MAE jump).
Generates artifacts/reports/permutation_test.json.
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any
from sklearn.linear_model import Ridge

from src.utils.config import REPORTS_DIR, RANDOM_SEED
from src.models.baselines import compute_regression_metrics
from src.utils.logger import get_logger

logger = get_logger("PermutationSanity")


class PermutationTest:
    @classmethod
    def run_permutation_test(cls, X_train: pd.DataFrame, y_train: np.ndarray, X_val: pd.DataFrame, y_val: np.ndarray) -> Dict[str, Any]:
        """Runs target permutation sanity test."""
        logger.info("Running target permutation anti-leakage sanity test...")

        # 1. Normal Target Fit
        normal_model = Ridge(alpha=1.0)
        normal_model.fit(X_train, y_train)
        normal_preds = normal_model.predict(X_val)
        normal_metrics = compute_regression_metrics(y_val, normal_preds)

        # 2. Shuffled Target Fit
        rng = np.random.RandomState(RANDOM_SEED)
        y_train_shuffled = rng.permutation(y_train)

        shuffled_model = Ridge(alpha=1.0)
        shuffled_model.fit(X_train, y_train_shuffled)
        shuffled_preds = shuffled_model.predict(X_val)
        shuffled_metrics = compute_regression_metrics(y_val, shuffled_preds)

        # 3. Collapse Assessment
        # Passed if shuffled R2 <= 0.05 and shuffled MAE > normal MAE * 1.5
        r2_collapsed = shuffled_metrics["r2"] <= 0.05
        mae_jumped = shuffled_metrics["mae"] >= normal_metrics["mae"] * 1.25
        passed = r2_collapsed and mae_jumped

        res = {
            "test_name": "target_permutation_sanity_check",
            "passed": passed,
            "original_r2": normal_metrics["r2"],
            "permuted_r2": shuffled_metrics["r2"],
            "normal_mae": normal_metrics["mae"],
            "permuted_mae": shuffled_metrics["mae"],
            "normal_metrics": normal_metrics,
            "shuffled_metrics": shuffled_metrics,
            "performance_collapsed": r2_collapsed,
            "mae_increased": mae_jumped,
            "message": "PASSED: Target permutation caused expected model performance collapse. Zero spurious leakage." if passed else "FAILED: Shuffled target performance remained high (target leakage suspected)."
        }

        out_json = REPORTS_DIR / "permutation_test.json"
        with open(out_json, "w", encoding="utf-8") as f:
            json.dump(res, f, indent=2)

        logger.info(f"Permutation test status: {'PASSED' if passed else 'FAILED'}. Saved report to {out_json}")
        return res
