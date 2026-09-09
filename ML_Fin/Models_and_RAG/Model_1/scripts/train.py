"""
GramBiz Model 1 -- Master Training Script
============================================
End-to-end pipeline: data loading -> cleaning -> merging ->
feature engineering -> MPI construction -> model training ->
evaluation -> artifact saving.

Usage:
    python scripts/train.py
    python scripts/train.py --category dairy
    python scripts/train.py --category retail --skip-tuning
"""

import argparse
import logging
import os
import sys
import time

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

import numpy as np
import pandas as pd

from src.data.feature_merging import build_merged_dataset
from src.features.engineering import engineer_features, get_feature_columns, get_feature_dictionary
from src.target.target_builder import build_mpi, sensitivity_analysis, ablation_analysis
from src.models.train import (
    create_geographic_holdout,
    train_all_models,
    train_final_model,
)
from src.models.evaluate import (
    generate_learning_curve,
    generate_feature_importance,
    generate_prediction_vs_actual,
    generate_residual_plot,
    generate_cv_scores_plot,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("train")


def main():
    parser = argparse.ArgumentParser(description="GramBiz Model 1 Training")
    parser.add_argument("--category", type=str, default="default",
                        help="Business category for MPI weights")
    parser.add_argument("--skip-tuning", action="store_true",
                        help="Skip hyperparameter tuning")
    args = parser.parse_args()

    start_time = time.time()

    print("=" * 60)
    print("GRAMBIZ MODEL 1 TRAINING")
    print("Hyper-Local Market Potential & Demand Prediction Engine")
    print("=" * 60)
    print()

    # ================================================================
    # [1/8] Loading datasets
    # ================================================================
    print("[1/8] Loading and merging datasets...")
    merged = build_merged_dataset(level="SUB-DISTRICT", tru="Rural", save=True)
    print(f"  Merged dataset: {merged.shape}")
    print()

    # ================================================================
    # [2/8] Feature engineering
    # ================================================================
    print("[2/8] Engineering features...")
    featured = engineer_features(merged)

    # Save feature dictionary
    feat_dict = get_feature_dictionary()
    os.makedirs(os.path.join(PROJECT_ROOT, "reports"), exist_ok=True)
    feat_dict.to_csv(os.path.join(PROJECT_ROOT, "reports", "feature_dictionary.csv"), index=False)
    print(f"  Features engineered: {featured.shape}")
    print()

    # ================================================================
    # [3/8] Building Market Potential Index (MPI)
    # ================================================================
    print(f"[3/8] Building MPI (category={args.category})...")
    mpi_data = build_mpi(featured, category=args.category)

    # Remove rows where MPI could not be computed (all NaN features)
    initial_rows = len(mpi_data)
    mpi_data = mpi_data.dropna(subset=["market_potential_index"])
    removed = initial_rows - len(mpi_data)
    if removed > 0:
        print(f"  Removed {removed} rows with NaN MPI")
    print(f"  MPI computed: {len(mpi_data)} rows")

    # Save feature dataset
    os.makedirs(os.path.join(PROJECT_ROOT, "data", "features"), exist_ok=True)
    mpi_data.to_csv(
        os.path.join(PROJECT_ROOT, "data", "features", "feature_dataset.csv"),
        index=False,
    )
    print()

    # ================================================================
    # [4/8] Sensitivity & ablation analysis
    # ================================================================
    print("[4/8] Running sensitivity & ablation analysis...")
    sens_report = sensitivity_analysis(featured, category=args.category)
    sens_report.to_csv(
        os.path.join(PROJECT_ROOT, "reports", "sensitivity_analysis.csv"), index=False
    )
    print(f"  Sensitivity analysis: {len(sens_report)} perturbations")
    print(sens_report[["component", "direction", "spearman_rank_correlation",
                        "mean_abs_score_change"]].to_string(index=False))

    abl_report = ablation_analysis(featured, category=args.category)
    abl_report.to_csv(
        os.path.join(PROJECT_ROOT, "reports", "ablation_analysis.csv"), index=False
    )
    print(f"\n  Ablation analysis:")
    print(abl_report.to_string(index=False))
    print()

    # ================================================================
    # [5/8] Preparing features and target
    # ================================================================
    print("[5/8] Preparing feature matrix...")
    feature_cols = get_feature_columns()

    # Filter to available features
    available_features = [c for c in feature_cols if c in mpi_data.columns]
    missing_features = [c for c in feature_cols if c not in mpi_data.columns]
    if missing_features:
        print(f"  WARNING: Missing features: {missing_features}")

    X_full = mpi_data[available_features].values
    y_full = mpi_data["market_potential_index"].values
    groups_full = mpi_data["district_code"].values

    print(f"  Feature matrix: {X_full.shape}")
    print(f"  Target range: [{y_full.min():.2f}, {y_full.max():.2f}]")
    print()

    # ================================================================
    # [6/8] Geographic holdout split
    # ================================================================
    print("[6/8] Creating geographic holdout...")
    train_df, holdout_df = create_geographic_holdout(
        mpi_data, holdout_fraction=0.15, group_col="district_code"
    )

    X_train = train_df[available_features].values
    y_train = train_df["market_potential_index"].values
    groups_train = train_df["district_code"].values

    X_holdout = holdout_df[available_features].values
    y_holdout = holdout_df["market_potential_index"].values

    print(f"  Training set: {X_train.shape}")
    print(f"  Holdout set: {X_holdout.shape}")
    print()

    # ================================================================
    # [7/8] Cross-validation across models
    # ================================================================
    print("[7/8] Cross-validation across candidate models...")
    comparison_df, all_results = train_all_models(
        X_train, y_train, available_features, groups=groups_train
    )

    # Save comparison
    os.makedirs(os.path.join(PROJECT_ROOT, "reports"), exist_ok=True)
    comparison_df.to_csv(
        os.path.join(PROJECT_ROOT, "reports", "model_comparison.csv"), index=False
    )
    print("\nModel Comparison:")
    print(comparison_df.to_string(index=False))
    print()

    # ================================================================
    # [8/8] Training final model
    # ================================================================
    print("[8/8] Training final model on full training set...")
    selected_row = comparison_df[comparison_df["selected"]].iloc[0]
    selected_name = selected_row["model"]

    # Get params from config
    import yaml
    with open(os.path.join(PROJECT_ROOT, "configs", "model_config.yaml"), "r") as f:
        model_config = yaml.safe_load(f)

    selected_params = {}
    for mc in model_config["candidate_models"]:
        if mc["name"] == selected_name:
            selected_params = mc.get("params", {})
            break

    final_result = train_final_model(
        X_train, y_train, X_holdout, y_holdout,
        available_features, selected_name, selected_params,
        category=args.category,
    )

    # ================================================================
    # Generate diagnostic plots
    # ================================================================
    print("\nGenerating diagnostic plots...")

    try:
        from sklearn.impute import SimpleImputer
        from sklearn.preprocessing import StandardScaler

        # Preprocess for learning curve
        imp = SimpleImputer(strategy="median")
        sc = StandardScaler()
        X_lc = imp.fit_transform(X_train)
        X_lc = sc.fit_transform(X_lc)

        from src.models.train import get_model_instance
        lc_model = get_model_instance(selected_name, selected_params)
        generate_learning_curve(lc_model, X_lc, y_train, groups=groups_train)
        print("  Learning curve generated")
    except Exception as e:
        print(f"  Learning curve skipped: {e}")

    generate_feature_importance(
        final_result["model"], available_features
    )
    print("  Feature importance generated")

    generate_prediction_vs_actual(
        final_result["y_holdout"], final_result["y_pred_holdout"], "Holdout"
    )
    print("  Prediction vs actual generated")

    generate_residual_plot(
        final_result["y_holdout"], final_result["y_pred_holdout"], "Holdout"
    )
    print("  Residual plot generated")

    generate_cv_scores_plot(comparison_df)
    print("  CV scores plot generated")

    # ================================================================
    # Summary
    # ================================================================
    elapsed = time.time() - start_time
    print()
    print("=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print(f"  Selected model: {selected_name}")
    print(f"  Training rows: {len(y_train)}")
    print(f"  Holdout rows: {len(y_holdout)}")
    print(f"  Features: {len(available_features)}")
    print(f"  Train MAE: {final_result['train_metrics']['mae']:.4f}")
    print(f"  Holdout MAE: {final_result['holdout_metrics']['mae']:.4f}")
    print(f"  Holdout R2: {final_result['holdout_metrics']['r2']:.4f}")
    print(f"  Holdout Spearman: {final_result['holdout_metrics']['spearman_rank']:.4f}")
    print(f"  Generalization gap: {final_result['generalization_gap']:.4f}")
    print(f"  Total time: {elapsed:.1f}s")
    print(f"  Model saved: {final_result['model_path']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
