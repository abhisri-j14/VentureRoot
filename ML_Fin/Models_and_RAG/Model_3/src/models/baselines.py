"""
GramBiz Model 3 — Baseline Models Suite
========================================
Implements non-ML & statistical benchmark baselines:
1. Persistence / Last Observed Price (y_t = y_{t-1}).
2. Commodity-Market Previous Price Baseline.
3. 7-day Rolling Historical Median Baseline.
4. Commodity-Market Historical Median Baseline.
5. Seasonal Historical Median Baseline (Commodity + Month).
6. Global / Market Median Baseline.
7. DummyRegressor (Global Median).
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, median_absolute_error
from sklearn.dummy import DummyRegressor

from src.utils.logger import get_logger

logger = get_logger("Baselines")


def compute_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Computes MAE, RMSE, R2, sMAPE, WAPE, Median AE, and Spearman rank correlation."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)

    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    median_ae = float(median_absolute_error(y_true, y_pred))

    # Symmetric MAPE
    denom = (np.abs(y_true) + np.abs(y_pred)) / 2.0
    smape = float(np.mean(np.where(denom > 0, np.abs(y_true - y_pred) / denom, 0.0)) * 100.0)

    # Weighted Absolute Percentage Error (WAPE)
    sum_true = float(np.sum(np.abs(y_true)))
    wape = float((np.sum(np.abs(y_true - y_pred)) / sum_true) * 100.0) if sum_true > 0 else 0.0

    # Spearman rank correlation
    from scipy.stats import spearmanr
    corr, _ = spearmanr(y_true, y_pred)
    spearman = float(corr) if not np.isnan(corr) else 0.0

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "smape": round(smape, 4),
        "wape": round(wape, 4),
        "median_ae": round(median_ae, 4),
        "spearman": round(spearman, 4)
    }


class BaselineEvaluator:
    @staticmethod
    def evaluate_persistence_baseline(df_val: pd.DataFrame, target_col: str = "normalized_price", lag_col: str = "lag_1_price") -> Dict[str, float]:
        """1. Persistence baseline: predicts today's price equal to lag_1_price."""
        y_true = df_val[target_col].values
        y_pred = df_val[lag_col].values
        metrics = compute_regression_metrics(y_true, y_pred)
        metrics["model_name"] = "Persistence (Lag-1 Naive)"
        return metrics

    @staticmethod
    def evaluate_rolling_7d_median_baseline(df_val: pd.DataFrame, target_col: str = "normalized_price", col: str = "rolling_median_7") -> Dict[str, float]:
        """2. 7-day Historical Median baseline."""
        y_true = df_val[target_col].values
        y_pred = df_val[col].values
        metrics = compute_regression_metrics(y_true, y_pred)
        metrics["model_name"] = "7-Day Historical Median"
        return metrics

    @staticmethod
    def evaluate_commodity_market_median_baseline(df_train: pd.DataFrame, df_val: pd.DataFrame, target_col: str = "normalized_price") -> Dict[str, float]:
        """3. Commodity-Market historical median baseline."""
        cm_medians = df_train.groupby(["commodity", "market"])[target_col].median().to_dict()
        comm_medians = df_train.groupby("commodity")[target_col].median().to_dict()
        global_med = float(df_train[target_col].median())

        y_true = df_val[target_col].values
        y_pred = []
        for _, row in df_val.iterrows():
            key = (row["commodity"], row["market"])
            val = cm_medians.get(key, comm_medians.get(row["commodity"], global_med))
            y_pred.append(val)
        metrics = compute_regression_metrics(y_true, np.array(y_pred))
        metrics["model_name"] = "Commodity-Market Median"
        return metrics

    @staticmethod
    def evaluate_seasonal_median_baseline(df_train: pd.DataFrame, df_val: pd.DataFrame, target_col: str = "normalized_price") -> Dict[str, float]:
        """4. Seasonal historical median (Commodity + Month)."""
        cm_medians = df_train.groupby(["commodity", "month"])[target_col].median().to_dict()
        comm_medians = df_train.groupby("commodity")[target_col].median().to_dict()
        global_med = float(df_train[target_col].median())

        y_true = df_val[target_col].values
        y_pred = []
        for _, row in df_val.iterrows():
            key = (row["commodity"], row["month"])
            val = cm_medians.get(key, comm_medians.get(row["commodity"], global_med))
            y_pred.append(val)
        metrics = compute_regression_metrics(y_true, np.array(y_pred))
        metrics["model_name"] = "Seasonal (Commodity+Month) Median"
        return metrics

    @staticmethod
    def evaluate_commodity_median_baseline(df_train: pd.DataFrame, df_val: pd.DataFrame, target_col: str = "normalized_price") -> Dict[str, float]:
        """5. Commodity median baseline."""
        comm_medians = df_train.groupby("commodity")[target_col].median().to_dict()
        global_med = float(df_train[target_col].median())

        y_true = df_val[target_col].values
        y_pred = df_val["commodity"].map(comm_medians).fillna(global_med).values
        metrics = compute_regression_metrics(y_true, y_pred)
        metrics["model_name"] = "Commodity Median Baseline"
        return metrics

    @staticmethod
    def evaluate_market_median_baseline(df_train: pd.DataFrame, df_val: pd.DataFrame, target_col: str = "normalized_price") -> Dict[str, float]:
        """6. Market median baseline."""
        market_medians = df_train.groupby("market")[target_col].median().to_dict()
        global_med = float(df_train[target_col].median())

        y_true = df_val[target_col].values
        y_pred = df_val["market"].map(market_medians).fillna(global_med).values
        metrics = compute_regression_metrics(y_true, y_pred)
        metrics["model_name"] = "Market Median Baseline"
        return metrics

    @staticmethod
    def evaluate_dummy_regressor(df_train: pd.DataFrame, df_val: pd.DataFrame, target_col: str = "normalized_price") -> Dict[str, float]:
        """7. Scikit-learn DummyRegressor (Global Median)."""
        dummy = DummyRegressor(strategy="median")
        dummy.fit(df_train[[target_col]], df_train[target_col])
        y_pred = dummy.predict(df_val[[target_col]])
        metrics = compute_regression_metrics(df_val[target_col].values, y_pred)
        metrics["model_name"] = "DummyRegressor (Global Median)"
        return metrics

    @classmethod
    def run_all_baselines(cls, df_train: pd.DataFrame, df_val: pd.DataFrame, target_col: str = "normalized_price") -> pd.DataFrame:
        """Evaluates all baselines and returns summary DataFrame."""
        results = [
            cls.evaluate_persistence_baseline(df_val, target_col),
            cls.evaluate_rolling_7d_median_baseline(df_val, target_col),
            cls.evaluate_commodity_market_median_baseline(df_train, df_val, target_col),
            cls.evaluate_seasonal_median_baseline(df_train, df_val, target_col),
            cls.evaluate_commodity_median_baseline(df_train, df_val, target_col),
            cls.evaluate_market_median_baseline(df_train, df_val, target_col),
            cls.evaluate_dummy_regressor(df_train, df_val, target_col)
        ]
        return pd.DataFrame(results)
