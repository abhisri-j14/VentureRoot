"""
GramBiz Model 2 -- Feature-Group Ablation Study
=================================================
Evaluates Ridge model performance across 8 feature subsets (A through H)
using identical 5-fold GroupKFold cross-validation by district_code.
Saves CSV results and comparison plot.
"""

import logging
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from typing import Any, Dict, List
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from src.config import PLOTS_DIR, PROCESSED_DATA_DIR, RANDOM_SEED, REPORTS_DIR
from src.features.engineering import ML_INPUT_FEATURES, engineer_features
from src.models.train import cross_validate_model, get_model_instance
from src.target.target_builder import build_viability_score

logger = logging.getLogger(__name__)

# Define Ablation Subsets
ABLATION_SUBSETS: Dict[str, Dict[str, Any]] = {
    "A. All Features": {
        "features": ML_INPUT_FEATURES,
        "description": "Complete set of 19 leakage-safe engineered features"
    },
    "B. Census-Only": {
        "features": [
            "literacy_rate", "female_literacy_rate", "sc_st_population_share",
            "working_pop_ratio", "workers_cultivator_share", "workers_agri_labour_share",
            "workers_hh_industry_share", "workers_other_share", "pop_density_per_sqkm",
            "households_per_village", "inhabited_village_ratio", "pop_0_6_ratio",
            "gender_ratio_females_per_1k"
        ],
        "description": "Census 2011 demographic and workforce features only"
    },
    "C. Udyam MSME-Only": {
        "features": [
            "msme_micro_per_1k", "msme_small_per_1k", "msme_medium_per_1k",
            "msme_total_per_1k", "msme_micro_share", "msme_small_share"
        ],
        "description": "Udyam MSME density and size distribution features only"
    },
    "D. Infrastructure-Only": {
        "features": [
            "inhabited_village_ratio", "households_per_village", "pop_density_per_sqkm",
            "sc_st_population_share"
        ],
        "description": "Settlement structure and community infrastructure features"
    },
    "E. Without Demand Features": {
        "features": [f for f in ML_INPUT_FEATURES if f not in ["working_pop_ratio", "pop_density_per_sqkm"]],
        "description": "All features excluding direct demand building blocks"
    },
    "F. Without Purchasing Power Features": {
        "features": [f for f in ML_INPUT_FEATURES if f not in ["literacy_rate", "female_literacy_rate", "working_pop_ratio"]],
        "description": "All features excluding literacy and working population ratios"
    },
    "G. Without Infrastructure Features": {
        "features": [f for f in ML_INPUT_FEATURES if f not in ["inhabited_village_ratio", "households_per_village", "sc_st_population_share"]],
        "description": "All features excluding village settlement and social infrastructure"
    },
    "H. Without MSME Features": {
        "features": [f for f in ML_INPUT_FEATURES if not f.startswith("msme_")],
        "description": "All features excluding Udyam MSME metrics"
    }
}


def run_feature_ablation_study() -> pd.DataFrame:
    """Run GroupKFold cross-validation across all ablation subsets."""
    dataset_path = os.path.join(PROCESSED_DATA_DIR, "merged_dataset.csv")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Merged dataset not found at {dataset_path}")

    df_raw = pd.read_csv(dataset_path)
    df_feat = engineer_features(df_raw)
    df_target = build_viability_score(df_feat, category="Other")

    y = df_target["viability_score"].values
    groups = df_target["district_code"].values

    results = []

    for name, config in ABLATION_SUBSETS.items():
        feat_list = [f for f in config["features"] if f in df_target.columns]
        if not feat_list:
            continue

        X_sub = df_target[feat_list].fillna(df_target[feat_list].median()).values

        model = get_model_instance("Ridge")
        cv_res = cross_validate_model(model, X_sub, y, groups=groups, n_folds=5)

        results.append({
            "subset_name": name,
            "feature_count": len(feat_list),
            "cv_mae_mean": cv_res["cv_mae_mean"],
            "cv_mae_std": cv_res["cv_mae_std"],
            "cv_rmse_mean": cv_res["cv_rmse_mean"],
            "cv_r2_mean": cv_res["cv_r2_mean"],
            "cv_spearman_mean": cv_res["cv_spearman_rank_mean"],
            "generalization_gap": cv_res["generalization_gap"],
            "description": config["description"]
        })

    res_df = pd.DataFrame(results).sort_values("cv_mae_mean")

    # Save CSV
    os.makedirs(REPORTS_DIR, exist_ok=True)
    csv_path = os.path.join(REPORTS_DIR, "ablation_results.csv")
    res_df.to_csv(csv_path, index=False)

    # Plot Comparison
    plt.figure(figsize=(10, 6))
    sns.barplot(data=res_df, y="subset_name", x="cv_mae_mean", palette="Blues_r")
    plt.xlabel("GroupKFold Mean Absolute Error (MAE)", fontsize=11)
    plt.ylabel("Ablation Subset", fontsize=11)
    plt.title("GramBiz Model 2 -- Feature Group Ablation Performance (GroupKFold)", fontsize=13, pad=12)
    plt.tight_layout()

    os.makedirs(PLOTS_DIR, exist_ok=True)
    plot_path = os.path.join(PLOTS_DIR, "ablation_comparison.png")
    plt.savefig(plot_path, dpi=300)

    alt_plots_dir = os.path.abspath(os.path.join(PLOTS_DIR, "..", "..", "plots"))
    os.makedirs(alt_plots_dir, exist_ok=True)
    plt.savefig(os.path.join(alt_plots_dir, "ablation_comparison.png"), dpi=300)
    plt.close()

    logger.info("Feature ablation study complete.")
    return res_df


if __name__ == "__main__":
    df_res = run_feature_ablation_study()
    print("Ablation Results:")
    print(df_res[["subset_name", "feature_count", "cv_mae_mean", "cv_r2_mean", "cv_spearman_mean"]])
