"""
GramBiz Model 2 -- Permutation / Negative Control Anti-Leakage Test
======================================================================
Trains the Ridge pipeline on target vs target permuted (shuffled) values.
Verifies performance collapses on shuffled targets to guarantee anti-leakage sanity.
Saves report to artifacts/reports/permutation_test.json.
"""

import json
import logging
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import numpy as np
import pandas as pd

from src.config import FEATURE_METADATA_DIR, PROCESSED_DATA_DIR, RANDOM_SEED, REPORTS_DIR
from src.features.engineering import ML_INPUT_FEATURES, engineer_features
from src.models.train import cross_validate_model, get_model_instance
from src.target.target_builder import build_viability_score

logger = logging.getLogger(__name__)


def run_permutation_sanity_test(random_seed: int = RANDOM_SEED) -> dict:
    """Execute target permutation test and return metrics comparison."""
    dataset_path = os.path.join(PROCESSED_DATA_DIR, "merged_dataset.csv")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Merged dataset not found at {dataset_path}")

    df_raw = pd.read_csv(dataset_path)
    df_feat = engineer_features(df_raw)
    df_target = build_viability_score(df_feat, category="Other")

    avail_features = [f for f in ML_INPUT_FEATURES if f in df_target.columns]
    X = df_target[avail_features].fillna(df_target[avail_features].median()).values
    y_normal = df_target["viability_score"].values
    groups = df_target["district_code"].values

    rng = np.random.RandomState(random_seed)
    y_permuted = rng.permutation(y_normal)

    # 1. Normal Model Evaluation
    model_normal = get_model_instance("Ridge")
    cv_normal = cross_validate_model(model_normal, X, y_normal, groups=groups, n_folds=5)

    # 2. Permuted Model Evaluation
    model_permuted = get_model_instance("Ridge")
    cv_permuted = cross_validate_model(model_permuted, X, y_permuted, groups=groups, n_folds=5)

    r2_normal = cv_normal["cv_r2_mean"]
    r2_permuted = cv_permuted["cv_r2_mean"]
    mae_normal = cv_normal["cv_mae_mean"]
    mae_permuted = cv_permuted["cv_mae_mean"]

    collapse_verified = (r2_permuted <= 0.05) and (mae_permuted > mae_normal * 10.0)

    report = {
        "random_seed": random_seed,
        "n_samples": len(y_normal),
        "n_features": X.shape[1],
        "normal_target_metrics": {
            "cv_mae_mean": mae_normal,
            "cv_rmse_mean": cv_normal["cv_rmse_mean"],
            "cv_r2_mean": r2_normal,
            "cv_spearman_mean": cv_normal["cv_spearman_rank_mean"]
        },
        "permuted_target_metrics": {
            "cv_mae_mean": mae_permuted,
            "cv_rmse_mean": cv_permuted["cv_rmse_mean"],
            "cv_r2_mean": r2_permuted,
            "cv_spearman_mean": cv_permuted["cv_spearman_rank_mean"]
        },
        "performance_collapse_verified": collapse_verified,
        "anti_leakage_status": "PASSED" if collapse_verified else "WARNING"
    }

    os.makedirs(REPORTS_DIR, exist_ok=True)
    report_path = os.path.join(REPORTS_DIR, "permutation_test.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logger.info(f"Permutation test saved to {report_path}")
    return report


if __name__ == "__main__":
    res = run_permutation_sanity_test()
    print("Permutation Test Result:", json.dumps(res, indent=2))
