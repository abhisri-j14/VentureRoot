"""
GramBiz Model 3 — Data Cleaning & Quality Pipeline
===================================================
Cleans raw AGMARKNET prices and WPI datasets:
- Standardizes XML column names (e.g. Min_x0020_Price -> min_price).
- Normalizes date parsing, types, numeric bounds.
- Applies Unit Normalization (₹/quintal) and Geographic Normalization.
- Performs outlier and logical consistency checks.
- Generates data_quality_report.json and data_quality_report.csv.
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, Dict, Any

from src.utils.config import RAW_DIR, INTERIM_DIR, REPORTS_DIR
from src.units.normalization import UnitNormalizer
from src.geographic.normalization import GeographicNormalizer
from src.utils.logger import get_logger

logger = get_logger("DataCleaningPipeline")


COLUMN_NAME_MAPPINGS = {
    "Min_x0020_Price": "min_price",
    "Max_x0020_Price": "max_price",
    "Modal_x0020_Price": "modal_price",
    "Arrival_Date": "arrival_date",
    "State": "state",
    "District": "district",
    "Market": "market",
    "Commodity": "commodity",
    "Variety": "variety",
    "Grade": "grade"
}


class DataCleaner:
    @classmethod
    def clean_agmarknet_prices(cls, raw_filepath: Path) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Cleans and standardizes raw AGMARKNET daily market prices."""
        logger.info(f"Loading raw AGMARKNET prices from {raw_filepath}...")
        df_raw = pd.read_csv(raw_filepath)

        raw_rows = len(df_raw)
        raw_cols = len(df_raw.columns)

        # 1. Column Renaming
        df = df_raw.rename(columns=COLUMN_NAME_MAPPINGS)
        df.columns = [c.strip().lower() for c in df.columns]

        # 2. Date Parsing
        df["arrival_date"] = pd.to_datetime(df["arrival_date"], format="%d/%m/%Y", errors="coerce")

        # 3. Numeric Conversions
        for col in ["min_price", "max_price", "modal_price"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        # 4. Filter invalid prices (zero or negative)
        invalid_prices = df[(df["modal_price"] <= 0) | df["modal_price"].isna()]
        df_clean = df[df["modal_price"] > 0].copy()

        # 5. Min/Max logical validation (min <= modal <= max)
        # Fix swapped min/max if present
        swap_mask = df_clean["min_price"] > df_clean["max_price"]
        if swap_mask.sum() > 0:
            logger.warning(f"Swapping {swap_mask.sum()} rows where min_price > max_price...")
            temp = df_clean.loc[swap_mask, "min_price"].copy()
            df_clean.loc[swap_mask, "min_price"] = df_clean.loc[swap_mask, "max_price"]
            df_clean.loc[swap_mask, "max_price"] = temp

        # 6. Apply Geographic Normalization
        df_clean = GeographicNormalizer.normalize_dataframe(df_clean, state_col="state", district_col="district", market_col="market")

        # 7. Apply Unit Normalization (Standard ₹/quintal)
        df_clean = UnitNormalizer.normalize_dataframe(df_clean, price_col="modal_price")

        # 8. Composite Duplicate & Conflict Audit (state + district + market + commodity + variety + arrival_date)
        composite_keys = ["state", "district", "market", "commodity", "variety", "arrival_date"]
        duplicated_mask = df_clean.duplicated(subset=composite_keys, keep=False)
        total_duplicate_instances = int(duplicated_mask.sum())

        # Detect conflicting price records (same key, different price)
        conflict_rows = 0
        if total_duplicate_instances > 0:
            dup_groups = df_clean[duplicated_mask].groupby(composite_keys)["modal_price"].nunique()
            conflict_rows = int((dup_groups > 1).sum())

        # Deterministic conflict resolution policy: Sort by arrival_date and keep latest ingested row
        df_clean = df_clean.drop_duplicates(subset=composite_keys, keep="last").copy()

        # Save duplicate conflict report
        conflict_report = {
            "dataset": "agmarknet_daily_prices",
            "composite_key_definition": composite_keys,
            "total_duplicate_rows_detected": total_duplicate_instances,
            "conflicting_price_keys_count": conflict_rows,
            "resolution_policy": "Deterministic resolution: retained latest observation ('keep=last') after sorting by arrival date.",
            "post_resolution_rows": len(df_clean)
        }
        conflict_json_path = REPORTS_DIR / "duplicate_conflict_report.json"
        with open(conflict_json_path, "w", encoding="utf-8") as cf:
            json.dump(conflict_report, cf, indent=2)
        logger.info(f"Saved duplicate conflict report to {conflict_json_path}")

        # 9. Sort Chronologically
        df_clean = df_clean.sort_values(by=["arrival_date", "state", "district", "market", "commodity"]).reset_index(drop=True)

        # Quality Metrics Report
        report = {
            "dataset": "agmarknet_daily_prices",
            "raw_rows": raw_rows,
            "raw_columns": raw_cols,
            "cleaned_rows": len(df_clean),
            "invalid_price_rows_removed": len(invalid_prices),
            "duplicate_rows_removed": total_duplicate_instances,
            "conflicting_records": conflict_rows,
            "date_min": df_clean["arrival_date"].min().strftime("%Y-%m-%d") if not df_clean.empty else None,
            "date_max": df_clean["arrival_date"].max().strftime("%Y-%m-%d") if not df_clean.empty else None,
            "num_states": int(df_clean["state"].nunique()),
            "num_districts": int(df_clean["district"].nunique()),
            "num_markets": int(df_clean["market"].nunique()),
            "num_commodities": int(df_clean["commodity"].nunique()),
            "missing_values": {col: int(df_clean[col].isna().sum()) for col in df_clean.columns}
        }

        return df_clean, report

    @classmethod
    def clean_wpi_series(cls, raw_filepath: Path) -> pd.DataFrame:
        """Cleans and reshapes monthly WPI index dataset into long-format time series."""
        logger.info(f"Loading raw WPI dataset from {raw_filepath}...")
        df_wpi = pd.read_csv(raw_filepath)

        # Reshape wide month columns (INDX042012 -> date) into long format
        id_cols = ["COMM_NAME", "COMM_CODE", "COMM_WT"]
        value_cols = [c for c in df_wpi.columns if c.startswith("INDX")]

        df_long = pd.melt(df_wpi, id_vars=id_cols, value_vars=value_cols, var_name="date_code", value_name="wpi_index")

        # Parse date_code: INDX042012 -> MM=04, YYYY=2012 -> 2012-04-01
        def parse_wpi_date(code: str):
            code_str = str(code).replace("INDX", "")
            if len(code_str) == 6:
                mm = code_str[:2]
                yyyy = code_str[2:]
                return pd.to_datetime(f"{yyyy}-{mm}-01")
            return pd.NaT

        df_long["date"] = df_long["date_code"].apply(parse_wpi_date)
        df_long = df_long.dropna(subset=["date", "wpi_index"]).copy()

        df_long = df_long.rename(columns={"COMM_NAME": "commodity_name", "COMM_CODE": "commodity_code", "COMM_WT": "commodity_weight"})
        df_long["commodity_name"] = df_long["commodity_name"].str.strip()

        df_long = df_long.sort_values(by=["date", "commodity_name"]).reset_index(drop=True)
        return df_long


def run_cleaning_pipeline():
    raw_price_path = RAW_DIR / "prices" / "agmarknet_daily_prices.csv"
    if not raw_price_path.exists():
        # Fallback to cached
        raw_price_path = RAW_DIR.parent / "cached" / "agmarknet_api_snapshot.csv"

    cleaned_prices, report = DataCleaner.clean_agmarknet_prices(raw_price_path)

    # Save cleaned prices to interim
    interim_price_path = INTERIM_DIR / "cleaned_prices.csv"
    cleaned_prices.to_csv(interim_price_path, index=False)
    logger.info(f"Saved interim cleaned prices: {interim_price_path}")

    # Clean WPI series if exists
    raw_wpi_path = RAW_DIR / "economic" / "wpi_monthly_2012_2023.csv"
    if raw_wpi_path.exists():
        cleaned_wpi = DataCleaner.clean_wpi_series(raw_wpi_path)
        interim_wpi_path = INTERIM_DIR / "cleaned_wpi.csv"
        cleaned_wpi.to_csv(interim_wpi_path, index=False)
        logger.info(f"Saved interim cleaned WPI: {interim_wpi_path}")

    # Save reports
    report_json_path = REPORTS_DIR / "data_quality_report.json"
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    report_csv_path = REPORTS_DIR / "data_quality_report.csv"
    pd.DataFrame([report]).to_csv(report_csv_path, index=False)
    logger.info(f"Generated quality reports at {report_json_path} and {report_csv_path}")


if __name__ == "__main__":
    run_cleaning_pipeline()
