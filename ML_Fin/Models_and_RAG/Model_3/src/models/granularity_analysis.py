"""
GramBiz Model 3 — Granularity Diagnostics Engine
=================================================
Evaluates model performance across fine-grained slices:
1. Commodity-wise performance (`commodity_metrics.csv` & plot)
2. Market-wise performance (`market_metrics.csv` & plot)
3. State & District-wise performance (`state_metrics.csv`, `district_metrics.csv`)
4. Quantile-based Price Band performance (`price_band_metrics.csv` & plot)

Minimum sample threshold: 5 samples per slice. If sample count < 5, returns "insufficient_data".
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from src.utils.config import REPORTS_DIR, PLOTS_DIR
from src.models.baselines import compute_regression_metrics
from src.utils.logger import get_logger

logger = get_logger("GranularityAnalysis")

MIN_SAMPLE_THRESHOLD = 5


class GranularityAnalyzer:
    @staticmethod
    def evaluate_commodity_performance(df_eval: pd.DataFrame, y_true: np.ndarray, y_pred: np.ndarray) -> pd.DataFrame:
        """Evaluates commodity-level metrics."""
        df_tmp = df_eval.copy()
        df_tmp["y_true"] = y_true
        df_tmp["y_pred"] = y_pred

        rows = []
        for comm, grp in df_tmp.groupby("commodity"):
            n = len(grp)
            if n < MIN_SAMPLE_THRESHOLD:
                rows.append({
                    "commodity": comm,
                    "sample_count": n,
                    "status": "insufficient_data",
                    "mae": np.nan, "rmse": np.nan, "r2": np.nan, "smape": np.nan, "wape": np.nan, "median_ae": np.nan
                })
            else:
                m = compute_regression_metrics(grp["y_true"].values, grp["y_pred"].values)
                m["commodity"] = comm
                m["sample_count"] = n
                m["status"] = "sufficient_data"
                rows.append(m)

        res_df = pd.DataFrame(rows)
        res_df.to_csv(REPORTS_DIR / "commodity_metrics.csv", index=False)

        # Plot Commodity MAE Comparison
        valid_df = res_df[res_df["status"] == "sufficient_data"].sort_values(by="mae")
        if not valid_df.empty:
            plt.figure(figsize=(10, 6))
            plt.barh(valid_df["commodity"], valid_df["mae"], color="teal", edgecolor="black")
            plt.xlabel("MAE (₹/quintal)")
            plt.title("GramBiz Model 3 — Commodity-Wise Error (MAE)")
            plt.tight_layout()
            plt.savefig(PLOTS_DIR / "commodity_error_comparison.png", dpi=300)
            plt.close()

        logger.info(f"Saved commodity metrics to {REPORTS_DIR / 'commodity_metrics.csv'}")
        return res_df

    @staticmethod
    def evaluate_market_performance(df_eval: pd.DataFrame, y_true: np.ndarray, y_pred: np.ndarray) -> pd.DataFrame:
        """Evaluates market-level metrics."""
        df_tmp = df_eval.copy()
        df_tmp["y_true"] = y_true
        df_tmp["y_pred"] = y_pred

        rows = []
        for mkt, grp in df_tmp.groupby("market"):
            n = len(grp)
            if n < MIN_SAMPLE_THRESHOLD:
                rows.append({
                    "market": mkt,
                    "sample_count": n,
                    "status": "insufficient_data",
                    "mae": np.nan, "rmse": np.nan, "r2": np.nan, "smape": np.nan, "wape": np.nan
                })
            else:
                m = compute_regression_metrics(grp["y_true"].values, grp["y_pred"].values)
                m["market"] = mkt
                m["sample_count"] = n
                m["status"] = "sufficient_data"
                rows.append(m)

        res_df = pd.DataFrame(rows)
        res_df.to_csv(REPORTS_DIR / "market_metrics.csv", index=False)

        valid_df = res_df[res_df["status"] == "sufficient_data"].sort_values(by="mae").tail(15)
        if not valid_df.empty:
            plt.figure(figsize=(10, 6))
            plt.barh(valid_df["market"], valid_df["mae"], color="coral", edgecolor="black")
            plt.xlabel("MAE (₹/quintal)")
            plt.title("GramBiz Model 3 — Market-Wise Error (MAE)")
            plt.tight_layout()
            plt.savefig(PLOTS_DIR / "market_error_comparison.png", dpi=300)
            plt.close()

        logger.info(f"Saved market metrics to {REPORTS_DIR / 'market_metrics.csv'}")
        return res_df

    @staticmethod
    def evaluate_geographic_performance(df_eval: pd.DataFrame, y_true: np.ndarray, y_pred: np.ndarray) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Evaluates state and district-level metrics."""
        df_tmp = df_eval.copy()
        df_tmp["y_true"] = y_true
        df_tmp["y_pred"] = y_pred

        # State level
        state_rows = []
        for st, grp in df_tmp.groupby("state"):
            if len(grp) >= MIN_SAMPLE_THRESHOLD:
                m = compute_regression_metrics(grp["y_true"].values, grp["y_pred"].values)
                m["state"] = st
                m["sample_count"] = len(grp)
                state_rows.append(m)
        state_df = pd.DataFrame(state_rows)
        state_df.to_csv(REPORTS_DIR / "state_metrics.csv", index=False)

        # District level
        dist_rows = []
        for dt, grp in df_tmp.groupby("district"):
            if len(grp) >= MIN_SAMPLE_THRESHOLD:
                m = compute_regression_metrics(grp["y_true"].values, grp["y_pred"].values)
                m["district"] = dt
                m["sample_count"] = len(grp)
                dist_rows.append(m)
        dist_df = pd.DataFrame(dist_rows)
        dist_df.to_csv(REPORTS_DIR / "district_metrics.csv", index=False)

        logger.info("Saved state and district metrics.")
        return state_df, dist_df

    @staticmethod
    def evaluate_price_band_performance(df_eval: pd.DataFrame, y_true: np.ndarray, y_pred: np.ndarray) -> pd.DataFrame:
        """Evaluates price band performance using quantile bins (LOW, MEDIUM, HIGH, VERY_HIGH)."""
        df_tmp = df_eval.copy()
        df_tmp["y_true"] = y_true
        df_tmp["y_pred"] = y_pred

        # Quantile-based price bands
        quantiles = np.quantile(y_true, [0.0, 0.25, 0.50, 0.75, 1.0])
        labels = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]

        df_tmp["price_band"] = pd.qcut(df_tmp["y_true"], q=4, labels=labels, duplicates="drop")

        rows = []
        for band, grp in df_tmp.groupby("price_band", observed=False):
            if len(grp) > 0:
                m = compute_regression_metrics(grp["y_true"].values, grp["y_pred"].values)
                m["price_band"] = band
                m["sample_count"] = len(grp)
                m["min_price_in_band"] = float(grp["y_true"].min())
                m["max_price_in_band"] = float(grp["y_true"].max())
                rows.append(m)

        band_df = pd.DataFrame(rows)
        band_df.to_csv(REPORTS_DIR / "price_band_metrics.csv", index=False)

        plt.figure(figsize=(8, 5))
        plt.bar(band_df["price_band"].astype(str), band_df["mae"], color="mediumseagreen", edgecolor="black")
        plt.xlabel("Price Band (Quantile)")
        plt.ylabel("MAE (₹/quintal)")
        plt.title("GramBiz Model 3 — Error by Price Band")
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / "price_band_error.png", dpi=300)
        plt.close()

        logger.info(f"Saved price band metrics to {REPORTS_DIR / 'price_band_metrics.csv'}")
        return band_df
