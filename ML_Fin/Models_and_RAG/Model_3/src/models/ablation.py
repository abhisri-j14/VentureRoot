"""
GramBiz Model 3 — Feature Group Ablation Experiment Suite
===========================================================
Evaluates predictive contribution of individual feature subsets:
A. Historical Price Lags Only
B. Temporal / Seasonal Features Only
C. WPI / Economic Indicators Only
D. All Features Combined
Outputs report to artifacts/reports/ablation_results.csv.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Any
from sklearn.linear_model import Ridge

from src.utils.config import REPORTS_DIR
from src.models.baselines import compute_regression_metrics
from src.utils.logger import get_logger

logger = get_logger("AblationStudy")


class AblationExperiment:
    @classmethod
    def run_ablation(cls, X_train: pd.DataFrame, y_train: np.ndarray, X_val: pd.DataFrame, y_val: np.ndarray) -> pd.DataFrame:
        """Evaluates model performance across distinct feature subsets."""
        logger.info("Running feature group ablation study...")

        lags = [c for c in X_train.columns if "lag_" in c or "rolling_" in c]
        seasons = [c for c in X_train.columns if c in ["year", "month", "day_of_year", "quarter", "sin_month", "cos_month", "sin_day_of_year", "cos_day_of_year"]]
        wpis = [c for c in X_train.columns if "wpi" in c]

        feature_groups = {
            "A. Historical Price Lags Only": lags if lags else list(X_train.columns[:max(1, len(X_train.columns)//2)]),
            "B. Temporal / Seasonal Only": seasons if seasons else list(X_train.columns[max(0, len(X_train.columns)//2):]),
            "C. WPI / Economic Only": wpis if wpis else list(X_train.columns[:1]),
            "D. All Features Combined": list(X_train.columns)
        }

        results = []
        for name, cols in feature_groups.items():
            if not cols:
                continue
            model = Ridge(alpha=1.0)
            model.fit(X_train[cols], y_train)
            preds = model.predict(X_val[cols])

            m = compute_regression_metrics(y_val, preds)
            m["subset_name"] = name
            m["ablated_group"] = name
            m["val_mae"] = m["mae"]
            m["num_features"] = len(cols)
            results.append(m)

        res_df = pd.DataFrame(results)[["subset_name", "num_features", "mae", "rmse", "r2", "smape", "spearman"]]
        csv_out = REPORTS_DIR / "ablation_results.csv"
        res_df.to_csv(csv_out, index=False)
        logger.info(f"Saved ablation study results to {csv_out}")
        return res_df
