"""
GramBiz Model 3 — Explainability & Feature Importance
======================================================
Computes standardized feature importances and exports report to artifacts/reports/feature_importance.csv.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Any

from src.utils.config import REPORTS_DIR
from src.utils.logger import get_logger

logger = get_logger("Explainability")


class ModelExplainability:
    @staticmethod
    def compute_feature_importance(model: Any, feature_names: List[str]) -> pd.DataFrame:
        """Extracts feature importance from Ridge, Random Forest, or GBDT models."""
        importances = None
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
        elif hasattr(model, "coef_"):
            importances = np.abs(model.coef_)
        else:
            importances = np.ones(len(feature_names)) / len(feature_names)

        df_imp = pd.DataFrame({
            "feature": feature_names,
            "importance": importances
        }).sort_values(by="importance", ascending=False).reset_index(drop=True)

        # Normalize to sum to 1.0
        total = df_imp["importance"].sum()
        if total > 0:
            df_imp["importance"] = df_imp["importance"] / total

        df_imp["importance"] = df_imp["importance"].round(4)
        return df_imp

    @classmethod
    def generate_importance_report(cls, model: Any, feature_names: List[str] = None, feature_cols: List[str] = None) -> pd.DataFrame:
        names = feature_names or feature_cols or []
        df_imp = cls.compute_feature_importance(model, names)
        csv_out = REPORTS_DIR / "feature_importance.csv"
        df_imp.to_csv(csv_out, index=False)
        logger.info(f"Saved feature importance report to {csv_out}")
        return df_imp
