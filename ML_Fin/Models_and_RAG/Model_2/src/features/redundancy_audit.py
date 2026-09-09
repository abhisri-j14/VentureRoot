"""
GramBiz Model 2 -- Feature Redundancy & Correlation Audit
===========================================================
Computes Pearson/Spearman correlation matrices, VIF scores, near-zero variance,
and saves machine-readable audit reports and correlation heatmaps.
"""

import json
import logging
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from typing import Dict, List, Tuple
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.linear_model import LinearRegression

from src.config import FEATURE_METADATA_DIR, PLOTS_DIR, PROCESSED_DATA_DIR, REPORTS_DIR
from src.features.engineering import ML_INPUT_FEATURES, engineer_features

logger = logging.getLogger(__name__)


def compute_vif(X: pd.DataFrame) -> List[Dict[str, float]]:
    """Compute Variance Inflation Factor (VIF) using linear regression."""
    vif_records = []
    cols = X.columns.tolist()
    for i, col in enumerate(cols):
        y_col = X[col].values
        X_other = X.drop(columns=[col]).values
        if X_other.shape[1] == 0:
            vif_records.append({"feature": col, "vif": 1.0})
            continue

        lr = LinearRegression()
        lr.fit(X_other, y_col)
        r2 = lr.score(X_other, y_col)
        vif_val = 1.0 / max(1e-5, (1.0 - r2))
        vif_records.append({"feature": col, "vif": round(float(vif_val), 2)})
    return vif_records


def run_feature_redundancy_audit() -> Dict[str, str]:
    """Execute complete feature redundancy, VIF, and correlation audit."""
    dataset_path = os.path.join(PROCESSED_DATA_DIR, "merged_dataset.csv")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Merged dataset not found at {dataset_path}")

    df_raw = pd.read_csv(dataset_path)
    df_feat = engineer_features(df_raw)

    avail_features = [f for f in ML_INPUT_FEATURES if f in df_feat.columns]
    X = df_feat[avail_features].fillna(df_feat[avail_features].median())

    # 1. Pearson Correlation
    pearson_corr = X.corr(method="pearson")
    spearman_corr = X.corr(method="spearman")

    # Save correlation CSV
    os.makedirs(REPORTS_DIR, exist_ok=True)
    corr_csv_path = os.path.join(REPORTS_DIR, "feature_correlation.csv")
    pearson_corr.to_csv(corr_csv_path)

    # Highly correlated pairs (|r| > 0.85)
    high_corr_pairs = []
    for i in range(len(avail_features)):
        for j in range(i + 1, len(avail_features)):
            f1, f2 = avail_features[i], avail_features[j]
            val = float(pearson_corr.loc[f1, f2])
            if abs(val) > 0.85:
                high_corr_pairs.append({
                    "feature_1": f1,
                    "feature_2": f2,
                    "pearson_correlation": round(val, 4)
                })

    # 2. Variance Inflation Factor (VIF)
    vif_records = compute_vif(X)

    # 3. Near-Zero Variance Detection
    variances = X.var()
    near_zero_var = [col for col in avail_features if float(variances[col]) < 1e-4]

    redundancy_report = {
        "total_ml_features": len(avail_features),
        "features": avail_features,
        "high_correlation_pairs": high_corr_pairs,
        "near_zero_variance_features": near_zero_var,
        "vif_scores": vif_records
    }

    # Save JSON report
    os.makedirs(FEATURE_METADATA_DIR, exist_ok=True)
    json_report_path = os.path.join(REPORTS_DIR, "feature_redundancy_report.json")
    with open(json_report_path, "w", encoding="utf-8") as f:
        json.dump(redundancy_report, f, indent=2)

    # 4. Generate Correlation Heatmap Plot
    plt.figure(figsize=(12, 10))
    sns.heatmap(pearson_corr, annot=False, cmap="coolwarm", vmin=-1.0, vmax=1.0, linewidths=0.5)
    plt.title("GramBiz Model 2 -- Feature Pearson Correlation Heatmap", fontsize=14, pad=12)
    plt.tight_layout()

    os.makedirs(PLOTS_DIR, exist_ok=True)
    heatmap_path = os.path.join(PLOTS_DIR, "feature_correlation_heatmap.png")
    plt.savefig(heatmap_path, dpi=300)

    # Also save copy to artifacts/plots/ if separate
    alt_plots_dir = os.path.abspath(os.path.join(PLOTS_DIR, "..", "..", "plots"))
    os.makedirs(alt_plots_dir, exist_ok=True)
    plt.savefig(os.path.join(alt_plots_dir, "feature_correlation_heatmap.png"), dpi=300)
    plt.close()

    logger.info("Feature redundancy audit complete.")
    return {
        "corr_csv": corr_csv_path,
        "json_report": json_report_path,
        "heatmap_plot": heatmap_path
    }


if __name__ == "__main__":
    res = run_feature_redundancy_audit()
    print("Audit finished:", res)
