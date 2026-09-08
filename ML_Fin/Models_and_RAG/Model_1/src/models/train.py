"""
GramBiz Model 1 -- Model Training Pipeline
=============================================
Trains multiple candidate models with proper cross-validation,
geographic holdout, and leakage prevention.

All preprocessing is fitted ONLY on training folds.
GroupKFold by district prevents geographic leakage.
A completely untouched geographic holdout set is reserved.
"""

import json
import logging
import os
import time
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
import yaml
from scipy import stats as sp_stats
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    median_absolute_error,
    r2_score,
)
from sklearn.model_selection import GroupKFold, KFold, RandomizedSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from tqdm import tqdm

logger = logging.getLogger(__name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def _load_model_config() -> dict:
    """Load model configuration."""
    path = os.path.join(BASE_DIR, "configs", "model_config.yaml")
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    """Compute all evaluation metrics."""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    med_ae = median_absolute_error(y_true, y_pred)
    spearman, spearman_p = sp_stats.spearmanr(y_true, y_pred)

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "median_ae": round(med_ae, 4),
        "spearman_rank": round(spearman, 4),
        "spearman_p_value": round(spearman_p, 6),
    }


def create_geographic_holdout(
    df: pd.DataFrame,
    holdout_fraction: float = 0.15,
    group_col: str = "district_code",
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Create a geographic holdout test set of entirely unseen districts.

    This holdout set is NEVER used for feature selection, weight tuning,
    or hyperparameter optimization.

    Parameters
    ----------
    df : pd.DataFrame
        Full dataset with features and target.
    holdout_fraction : float
        Fraction of unique districts to hold out.
    group_col : str
        Column defining geographic groups.
    random_state : int
        Random seed for reproducibility.

    Returns
    -------
    train_df, holdout_df : tuple of DataFrames
    """
    rng = np.random.RandomState(random_state)
    districts = df[group_col].unique()
    n_holdout = max(1, int(len(districts) * holdout_fraction))
    holdout_districts = rng.choice(districts, size=n_holdout, replace=False)

    holdout_mask = df[group_col].isin(holdout_districts)
    holdout_df = df[holdout_mask].copy()
    train_df = df[~holdout_mask].copy()

    logger.info(f"Geographic holdout: {len(holdout_districts)} districts, "
                f"{len(holdout_df)} rows held out, {len(train_df)} for training")

    return train_df, holdout_df


def get_model_instance(name: str, params: dict) -> Any:
    """Create a model instance by name."""
    if name == "DummyRegressor":
        return DummyRegressor(**params)
    elif name == "Ridge":
        return Ridge(**params)
    elif name == "RandomForest":
        return RandomForestRegressor(**params)
    elif name == "GradientBoosting":
        return GradientBoostingRegressor(**params)
    elif name == "XGBoost":
        from xgboost import XGBRegressor
        return XGBRegressor(**params)
    elif name == "LightGBM":
        from lightgbm import LGBMRegressor
        return LGBMRegressor(**params)
    elif name == "CatBoost":
        from catboost import CatBoostRegressor
        return CatBoostRegressor(**params)
    else:
        raise ValueError(f"Unknown model: {name}")


def cross_validate_model(
    model: Any,
    X: np.ndarray,
    y: np.ndarray,
    groups: Optional[np.ndarray] = None,
    n_folds: int = 5,
    use_group_kfold: bool = False,
    model_name: str = "",
    random_state: int = 42,
) -> dict:
    """
    Perform cross-validation with proper leakage prevention.

    All preprocessing (imputation, scaling) is fitted ONLY on training folds.

    Parameters
    ----------
    model : estimator
        sklearn-compatible model.
    X : np.ndarray
        Feature matrix.
    y : np.ndarray
        Target values.
    groups : np.ndarray, optional
        Group labels for GroupKFold (e.g., district codes).
    n_folds : int
        Number of CV folds.
    use_group_kfold : bool
        If True, use GroupKFold by district.
    model_name : str
        Name for logging.
    random_state : int
        Random seed.

    Returns
    -------
    dict
        CV results with fold-by-fold metrics.
    """
    if use_group_kfold and groups is not None:
        cv = GroupKFold(n_splits=n_folds)
        split_args = (X, y, groups)
        cv_type = "GroupKFold"
    else:
        cv = KFold(n_splits=n_folds, shuffle=True, random_state=random_state)
        split_args = (X, y)
        cv_type = "KFold"

    fold_metrics = []
    train_metrics_list = []

    for fold_idx, (train_idx, val_idx) in enumerate(cv.split(*split_args)):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        # ---- Preprocessing fitted ONLY on training fold ----
        imputer = SimpleImputer(strategy="median")
        scaler = StandardScaler()

        X_train = imputer.fit_transform(X_train)
        X_val = imputer.transform(X_val)

        X_train = scaler.fit_transform(X_train)
        X_val = scaler.transform(X_val)

        # ---- Train ----
        model_clone = _clone_model(model)
        model_clone.fit(X_train, y_train)

        # ---- Evaluate ----
        y_pred_val = model_clone.predict(X_val)
        y_pred_train = model_clone.predict(X_train)

        val_metrics = compute_metrics(y_val, y_pred_val)
        train_m = compute_metrics(y_train, y_pred_train)

        fold_metrics.append(val_metrics)
        train_metrics_list.append(train_m)

        print(f"  Fold {fold_idx + 1}/{n_folds}: "
              f"MAE={val_metrics['mae']:.4f} | "
              f"RMSE={val_metrics['rmse']:.4f} | "
              f"R2={val_metrics['r2']:.4f} | "
              f"Spearman={val_metrics['spearman_rank']:.4f}")

    # Aggregate
    cv_results = {}
    for metric in fold_metrics[0]:
        values = [f[metric] for f in fold_metrics]
        cv_results[f"cv_{metric}_mean"] = round(np.mean(values), 4)
        cv_results[f"cv_{metric}_std"] = round(np.std(values), 4)

    # Train metrics (average across folds)
    for metric in train_metrics_list[0]:
        values = [f[metric] for f in train_metrics_list]
        cv_results[f"train_{metric}_mean"] = round(np.mean(values), 4)

    # Generalization gap
    cv_results["generalization_gap_mae"] = round(
        abs(cv_results["train_mae_mean"] - cv_results["cv_mae_mean"]) / max(cv_results["train_mae_mean"], 1e-8),
        4
    )

    cv_results["cv_type"] = cv_type
    cv_results["n_folds"] = n_folds
    cv_results["fold_metrics"] = fold_metrics

    return cv_results


def _clone_model(model: Any) -> Any:
    """Clone a model to avoid fitting the same instance."""
    from sklearn.base import clone
    try:
        return clone(model)
    except Exception:
        # For non-sklearn models (CatBoost, XGBoost)
        return model.__class__(**model.get_params())


def train_all_models(
    X: np.ndarray,
    y: np.ndarray,
    feature_names: List[str],
    groups: Optional[np.ndarray] = None,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, dict]:
    """
    Train and evaluate all candidate models.

    Parameters
    ----------
    X : np.ndarray
        Feature matrix (training set, without holdout).
    y : np.ndarray
        Target values.
    feature_names : list of str
        Feature column names.
    groups : np.ndarray, optional
        District codes for GroupKFold.
    random_state : int
        Random seed.

    Returns
    -------
    comparison_df : pd.DataFrame
        Model comparison table.
    all_results : dict
        Full results for each model.
    """
    config = _load_model_config()
    candidates = config["candidate_models"]
    n_folds = config["validation"]["n_folds"]

    all_results = {}
    comparison_rows = []

    print("=" * 60)
    print("GRAMBIZ MODEL 1 TRAINING")
    print("=" * 60)
    print()

    for i, model_cfg in enumerate(candidates):
        name = model_cfg["name"]
        params = model_cfg.get("params", {})

        print(f"[{i + 1}/{len(candidates)}] Training {name}...")
        start = time.time()

        try:
            model = get_model_instance(name, params)
        except ImportError as e:
            logger.warning(f"Skipping {name}: {e}")
            print(f"  SKIPPED: {e}")
            continue

        # ---- GroupKFold (primary) ----
        print(f"  GroupKFold (by district):")
        gkf_results = cross_validate_model(
            model, X, y, groups=groups, n_folds=n_folds,
            use_group_kfold=True, model_name=name, random_state=random_state,
        )

        # ---- Standard KFold (for comparison) ----
        print(f"  Standard KFold:")
        kf_results = cross_validate_model(
            model, X, y, groups=None, n_folds=n_folds,
            use_group_kfold=False, model_name=name, random_state=random_state,
        )

        elapsed = time.time() - start

        all_results[name] = {
            "group_kfold": gkf_results,
            "standard_kfold": kf_results,
            "training_time": round(elapsed, 2),
        }

        comparison_rows.append({
            "model": name,
            "gkf_mae_mean": gkf_results["cv_mae_mean"],
            "gkf_mae_std": gkf_results["cv_mae_std"],
            "gkf_rmse_mean": gkf_results["cv_rmse_mean"],
            "gkf_r2_mean": gkf_results["cv_r2_mean"],
            "gkf_spearman_mean": gkf_results["cv_spearman_rank_mean"],
            "kf_mae_mean": kf_results["cv_mae_mean"],
            "kf_r2_mean": kf_results["cv_r2_mean"],
            "generalization_gap": gkf_results["generalization_gap_mae"],
            "training_time_s": round(elapsed, 2),
        })

        print(f"  -> GroupKFold MAE: {gkf_results['cv_mae_mean']:.4f} +/- {gkf_results['cv_mae_std']:.4f}")
        print(f"  -> Generalization gap: {gkf_results['generalization_gap_mae']:.4f}")
        print()

    comparison_df = pd.DataFrame(comparison_rows)
    comparison_df = comparison_df.sort_values("gkf_mae_mean")

    # Select best model: prefer lowest GroupKFold MAE with acceptable gap
    max_gap = config["model_selection"]["max_acceptable_generalization_gap"]
    eligible = comparison_df[comparison_df["generalization_gap"] <= max_gap]
    if len(eligible) > 0:
        best_name = eligible.iloc[0]["model"]
    else:
        best_name = comparison_df.iloc[0]["model"]
        logger.warning("No model meets generalization gap threshold. Selecting best MAE.")

    comparison_df["selected"] = comparison_df["model"] == best_name

    print("=" * 60)
    print(f"SELECTED MODEL: {best_name}")
    print("=" * 60)

    return comparison_df, all_results


def train_final_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_holdout: np.ndarray,
    y_holdout: np.ndarray,
    feature_names: List[str],
    model_name: str,
    model_params: dict,
    category: str = "default",
) -> dict:
    """
    Train the final selected model and evaluate on the geographic holdout.

    Parameters
    ----------
    X_train : np.ndarray
        Training features (without holdout).
    y_train : np.ndarray
        Training target.
    X_holdout : np.ndarray
        Holdout features (completely unseen districts).
    y_holdout : np.ndarray
        Holdout target.
    feature_names : list of str
        Feature column names.
    model_name : str
        Name of the selected model.
    model_params : dict
        Hyperparameters.
    category : str
        Business category used for MPI.

    Returns
    -------
    dict
        Training results, model artifacts, holdout performance.
    """
    print("\n[FINAL] Training final model on full training set...")

    # ---- Preprocessing (fitted on training set only) ----
    imputer = SimpleImputer(strategy="median")
    scaler = StandardScaler()

    X_train_processed = imputer.fit_transform(X_train)
    X_train_processed = scaler.fit_transform(X_train_processed)

    X_holdout_processed = imputer.transform(X_holdout)
    X_holdout_processed = scaler.transform(X_holdout_processed)

    # ---- Train ----
    model = get_model_instance(model_name, model_params)
    model.fit(X_train_processed, y_train)

    # ---- Evaluate on training set ----
    y_pred_train = model.predict(X_train_processed)
    train_metrics = compute_metrics(y_train, y_pred_train)
    print(f"  Train MAE: {train_metrics['mae']:.4f} | R2: {train_metrics['r2']:.4f}")

    # ---- Evaluate on holdout ----
    y_pred_holdout = model.predict(X_holdout_processed)
    holdout_metrics = compute_metrics(y_holdout, y_pred_holdout)
    print(f"  Holdout MAE: {holdout_metrics['mae']:.4f} | R2: {holdout_metrics['r2']:.4f}")
    print(f"  Holdout Spearman: {holdout_metrics['spearman_rank']:.4f}")

    # ---- Generalization gap ----
    gen_gap = abs(train_metrics["mae"] - holdout_metrics["mae"]) / max(train_metrics["mae"], 1e-8)
    print(f"  Generalization gap (MAE): {gen_gap:.4f}")

    # ---- Save artifacts ----
    models_dir = os.path.join(BASE_DIR, "models")
    os.makedirs(models_dir, exist_ok=True)

    # Save model
    model_path = os.path.join(models_dir, "model_1_final.joblib")
    joblib.dump(model, model_path)
    print(f"  Model saved: {model_path}")

    # Save preprocessing
    scaler_path = os.path.join(models_dir, "scaler.joblib")
    joblib.dump(scaler, scaler_path)

    imputer_path = os.path.join(models_dir, "imputer.joblib")
    joblib.dump(imputer, imputer_path)

    # Save feature schema
    feature_schema = {
        "feature_names": feature_names,
        "n_features": len(feature_names),
        "expected_order": feature_names,
    }
    schema_path = os.path.join(models_dir, "feature_schema.json")
    with open(schema_path, "w") as f:
        json.dump(feature_schema, f, indent=2)

    # Save metadata
    from datetime import datetime
    metadata = {
        "model_name": "GramBiz Hyper-Local Market Potential Engine",
        "model_type": model_name,
        "version": "1.0.0",
        "training_date": datetime.now().isoformat(),
        "category": category,
        "target_definition": "Market Potential Index (composite, NOT supervised label)",
        "is_supervised_label": False,
        "is_constructed_index": True,
        "dataset_versions": {
            "census": "2011",
            "hces_mpce": "2023-24",
            "cpi": "July 2026",
        },
        "feature_count": len(feature_names),
        "training_rows": len(y_train),
        "holdout_rows": len(y_holdout),
        "validation_method": "5-fold GroupKFold by district + geographic holdout",
        "train_metrics": train_metrics,
        "holdout_metrics": holdout_metrics,
        "generalization_gap": round(gen_gap, 4),
        "hyperparameters": model_params,
        "feature_list": feature_names,
        "geographic_level": "sub-district",
        "limitations": [
            "Census data is from 2011 -- absolute values may differ from current reality",
            "HCES MPCE is state-level only -- all sub-districts in same state share MPCE",
            "No actual business outcome labels -- MPI is a constructed index",
            "No geospatial radius calculation -- lat/lon not available",
            "No competitor/establishment count data",
            "Model provides relative ranking, not absolute demand prediction",
        ],
    }
    metadata_path = os.path.join(models_dir, "model_1_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2, default=str)
    print(f"  Metadata saved: {metadata_path}")

    return {
        "model": model,
        "imputer": imputer,
        "scaler": scaler,
        "train_metrics": train_metrics,
        "holdout_metrics": holdout_metrics,
        "generalization_gap": round(gen_gap, 4),
        "feature_names": feature_names,
        "model_path": model_path,
        "y_pred_holdout": y_pred_holdout,
        "y_holdout": y_holdout,
    }
