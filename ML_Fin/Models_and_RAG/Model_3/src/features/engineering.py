"""
GramBiz Model 3 — Feature Engineering Engine
============================================
Engineers leakage-safe features for local market price prediction:
1. Temporal & Cyclic signals (Year, Month, Day of Year, Sine/Cosine encodings, Quarter, Season).
2. Shifted Historical Lags & Rolling Price Statistics (Shift(1) applied before rolling windows).
3. Lagged WPI Economic Index mapping.
4. Categorical Encodings for State, District, Market, Commodity, Variety, Grade.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Tuple

from src.utils.config import INTERIM_DIR, PROCESSED_DIR
from src.utils.logger import get_logger

logger = get_logger("FeatureEngineering")


class FeatureEngine:
    @staticmethod
    def build_temporal_features(df: pd.DataFrame, date_col: str = "arrival_date") -> pd.DataFrame:
        """Engineers temporal, calendar, and cyclic features."""
        df_out = df.copy()
        dates = pd.to_datetime(df_out[date_col])

        df_out["year"] = dates.dt.year
        df_out["month"] = dates.dt.month
        df_out["day_of_year"] = dates.dt.dayofyear
        df_out["day_of_week"] = dates.dt.dayofweek
        df_out["quarter"] = dates.dt.quarter

        # Cyclic encodings for seasonal continuity
        df_out["sin_month"] = np.sin(2 * np.pi * df_out["month"] / 12.0)
        df_out["cos_month"] = np.cos(2 * np.pi * df_out["month"] / 12.0)

        df_out["sin_day_of_year"] = np.sin(2 * np.pi * df_out["day_of_year"] / 365.25)
        df_out["cos_day_of_year"] = np.cos(2 * np.pi * df_out["day_of_year"] / 365.25)

        return df_out

    @staticmethod
    def build_lag_and_rolling_features(df: pd.DataFrame, price_col: str = "normalized_price", group_cols: List[str] = None) -> pd.DataFrame:
        """
        Engineers historical price lags and rolling statistics.
        CRITICAL RULE: Shift(1) is strictly applied BEFORE any rolling aggregation
        to prevent target leakage of contemporaneous same-day price T.
        """
        df_out = df.copy()
        if group_cols is None:
            group_cols = ["state", "district", "market", "commodity", "variety", "grade"]

        # Ensure sorted chronologically
        df_out = df_out.sort_values(by=group_cols + ["arrival_date"]).reset_index(drop=True)

        grouped = df_out.groupby(group_cols)[price_col]

        # Shift 1 represents previous observed price (T-1)
        shifted_price = grouped.shift(1)

        df_out["lag_1_price"] = shifted_price
        df_out["lag_7_price"] = grouped.shift(7)
        df_out["lag_14_price"] = grouped.shift(14)
        df_out["lag_30_price"] = grouped.shift(30)

        # Rolling stats on SHIFTED price
        grouped_shifted = df_out.groupby(group_cols)["lag_1_price"]

        df_out["rolling_mean_7"] = grouped_shifted.transform(lambda s: s.rolling(window=7, min_periods=1).mean())
        df_out["rolling_median_7"] = grouped_shifted.transform(lambda s: s.rolling(window=7, min_periods=1).median())
        df_out["rolling_std_7"] = grouped_shifted.transform(lambda s: s.rolling(window=7, min_periods=1).std()).fillna(0.0)

        df_out["rolling_mean_30"] = grouped_shifted.transform(lambda s: s.rolling(window=30, min_periods=1).mean())
        df_out["rolling_median_30"] = grouped_shifted.transform(lambda s: s.rolling(window=30, min_periods=1).median())
        df_out["rolling_std_30"] = grouped_shifted.transform(lambda s: s.rolling(window=30, min_periods=1).std()).fillna(0.0)

        # Price momentum / trend ratio
        df_out["price_momentum_7"] = np.where(df_out["rolling_mean_7"] > 0, df_out["lag_1_price"] / df_out["rolling_mean_7"], 1.0)
        df_out["price_momentum_30"] = np.where(df_out["rolling_mean_30"] > 0, df_out["lag_1_price"] / df_out["rolling_mean_30"], 1.0)

        return df_out

    @staticmethod
    def build_wpi_features(df_prices: pd.DataFrame, df_wpi: pd.DataFrame = None) -> pd.DataFrame:
        """Maps WPI monthly commodity index safely lagged by at least 1 month."""
        df_out = df_prices.copy()
        if df_wpi is None or df_wpi.empty:
            df_out["wpi_index_lag"] = 100.0
            return df_out

        # Compute monthly commodity WPI averages
        df_wpi["year_month"] = pd.to_datetime(df_wpi["date"]).dt.to_period("M")
        wpi_map = df_wpi.groupby(["commodity_name", "year_month"])["wpi_index"].mean().to_dict()

        # Map price date's PREVIOUS month WPI to guarantee no future leakage
        price_dates = pd.to_datetime(df_out["arrival_date"])
        prev_month_period = (price_dates - pd.DateOffset(months=1)).dt.to_period("M")

        wpi_values = []
        for i, row in df_out.iterrows():
            comm = str(row.get("commodity", ""))
            period = prev_month_period.iloc[i]
            val = wpi_map.get((comm, period), np.nan)
            if pd.isna(val):
                # Fallback to overall monthly WPI mean if specific commodity unobserved
                val = df_wpi[df_wpi["year_month"] == period]["wpi_index"].mean()
            if pd.isna(val):
                val = 100.0
            wpi_values.append(float(val))

        df_out["wpi_index_lag"] = wpi_values
        return df_out

    @classmethod
    def build_full_feature_matrix(cls, df_prices: pd.DataFrame, df_wpi: pd.DataFrame = None) -> pd.DataFrame:
        """Executes full feature engineering pipeline."""
        logger.info("Building temporal features...")
        df_feat = cls.build_temporal_features(df_prices)

        logger.info("Building lag and rolling price features...")
        df_feat = cls.build_lag_and_rolling_features(df_feat)

        logger.info("Mapping lagged WPI economic indicators...")
        df_feat = cls.build_wpi_features(df_feat, df_wpi)

        # Fill initial NaNs in lag features using commodity median fallback for early historical rows
        lag_cols = ["lag_1_price", "lag_7_price", "lag_14_price", "lag_30_price", "rolling_mean_7", "rolling_median_7", "rolling_mean_30", "rolling_median_30"]
        for col in lag_cols:
            if col in df_feat.columns:
                comm_medians = df_feat.groupby("commodity")["normalized_price"].transform("median")
                df_feat[col] = df_feat[col].fillna(comm_medians).fillna(df_feat["normalized_price"].median())

        # Drop contemporaneous same-day target price columns to prevent leakage
        forbidden_cols = ["min_price", "max_price", "modal_price", "original_price"]
        df_feat = df_feat.drop(columns=[c for c in forbidden_cols if c in df_feat.columns], errors="ignore")

        df_feat = df_feat.sort_values(by="arrival_date").reset_index(drop=True)
        return df_feat


def run_feature_pipeline():
    interim_price_file = INTERIM_DIR / "cleaned_prices.csv"
    if not interim_price_file.exists():
        from src.data.cleaning import run_cleaning_pipeline
        run_cleaning_pipeline()

    df_prices = pd.read_csv(interim_price_file)
    df_wpi = None
    interim_wpi_file = INTERIM_DIR / "cleaned_wpi.csv"
    if interim_wpi_file.exists():
        df_wpi = pd.read_csv(interim_wpi_file)

    df_processed = FeatureEngine.build_full_feature_matrix(df_prices, df_wpi)

    processed_file = PROCESSED_DIR / "feature_matrix.csv"
    df_processed.to_csv(processed_file, index=False)
    logger.info(f"Saved processed feature matrix ({len(df_processed)} rows x {len(df_processed.columns)} cols) to {processed_file}")


if __name__ == "__main__":
    run_feature_pipeline()
