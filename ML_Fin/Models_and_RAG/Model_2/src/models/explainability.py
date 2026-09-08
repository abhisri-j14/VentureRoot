"""
GramBiz Model 2 -- Feature Explainability & Driver Importance Analysis
========================================================================
Extracts standardized feature coefficients for Ridge model, classifies associated
positive and negative drivers, saves CSV report, and generates feature importance plots.
"""

import logging
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from typing import Dict, List
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from src.config import PLOTS_DIR, PROCESSED_DATA_DIR, REPORTS_DIR
from src.features.engineering import ML_INPUT_FEATURES, engineer_features
from src.models.train import get_model_instance
from src.target.target_builder import build_viability_score

logger = logging.getLogger(__name__)


def run_explainability_analysis() -> pd.DataFrame:
    """Extract standardized coefficients and generate feature importance artifacts."""
    dataset_path = os.path.join(PROCESSED_DATA_DIR, "merged_dataset.csv")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Merged dataset not found at {dataset_path}")

    df_raw = pd.read_csv(dataset_path)
    df_feat = engineer_features(df_raw)
    df_target = build_viability_score(df_feat, category="Other")

    avail_features = [f for f in ML_INPUT_FEATURES if f in df_target.columns]
    X = df_target[avail_features].fillna(df_target[avail_features].median()).values
    y = df_target["viability_score"].values

    # Standardize features for comparable coefficients
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = get_model_instance("Ridge")
    model.fit(X_scaled, y)

    coefs = model.coef_
    abs_coefs = np.abs(coefs)

    imp_df = pd.DataFrame({
        "feature_name": avail_features,
        "standardized_coefficient": np.round(coefs, 4),
        "absolute_importance": np.round(abs_coefs, 4),
        "driver_direction": np.where(coefs > 0, "Positive Associated Driver", "Negative Associated Driver")
    }).sort_values("absolute_importance", ascending=False)

    # Save CSV
    os.makedirs(REPORTS_DIR, exist_ok=True)
    csv_path = os.path.join(REPORTS_DIR, "feature_importance.csv")
    imp_df.to_csv(csv_path, index=False)

    # Generate Feature Importance Bar Plot
    plt.figure(figsize=(10, 8))
    colors = ["#059669" if c > 0 else "#DC2626" for c in imp_df["standardized_coefficient"]]
    sns.barplot(data=imp_df, y="feature_name", x="standardized_coefficient", palette=colors, hue="feature_name", legend=False)
    plt.axvline(0, color="black", linestyle="--", linewidth=0.8)
    plt.xlabel("Standardized Model Coefficient", fontsize=11)
    plt.ylabel("Feature Name", fontsize=11)
    plt.title("GramBiz Model 2 -- Feature Standardized Coefficient Importance (Ridge)", fontsize=13, pad=12)
    plt.tight_layout()

    os.makedirs(PLOTS_DIR, exist_ok=True)
    plot_path = os.path.join(PLOTS_DIR, "feature_importance.png")
    plt.savefig(plot_path, dpi=300)

    alt_plots_dir = os.path.abspath(os.path.join(PLOTS_DIR, "..", "..", "plots"))
    os.makedirs(alt_plots_dir, exist_ok=True)
    plt.savefig(os.path.join(alt_plots_dir, "feature_importance.png"), dpi=300)
    plt.close()

    logger.info("Explainability analysis complete.")
    return imp_df


if __name__ == "__main__":
    df_imp = run_explainability_analysis()
    print("Feature Importances:")
    print(df_imp[["feature_name", "standardized_coefficient", "driver_direction"]])
