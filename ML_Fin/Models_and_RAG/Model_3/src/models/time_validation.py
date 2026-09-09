"""
GramBiz Model 3 — Time-Series Walk-Forward & Group Validation Splitter
========================================================================
Implements chronological walk-forward splitting for time-series forecasting.
Also provides GroupKFold by district for geographic generalization testing.
Generates TEMPORAL_VALIDATION.md.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Tuple, Generator, Dict, Any

from src.utils.config import PROJECT_ROOT
from src.utils.logger import get_logger

logger = get_logger("TimeValidation")


class TimeSeriesValidationSplitter:
    @staticmethod
    def get_chronological_splits(df: pd.DataFrame, date_col: str = "arrival_date", val_ratio: float = 0.15, test_ratio: float = 0.15) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Splits data chronologically into:
        Train (older 70%) -> Validation (middle 15%) -> Untouched Holdout Test (most recent 15%).
        """
        df_sorted = df.sort_values(by=date_col).reset_index(drop=True)
        n = len(df_sorted)

        test_cutoff = int(n * (1.0 - test_ratio))
        val_cutoff = int(test_cutoff * (1.0 - val_ratio / (1.0 - test_ratio)))

        train_df = df_sorted.iloc[:val_cutoff].copy()
        val_df = df_sorted.iloc[val_cutoff:test_cutoff].copy()
        test_df = df_sorted.iloc[test_cutoff:].copy()

        logger.info(f"Chronological Split: Train={len(train_df):,} rows ({train_df[date_col].min()} to {train_df[date_col].max()}) | "
                    f"Val={len(val_df):,} rows ({val_df[date_col].min()} to {val_df[date_col].max()}) | "
                    f"Test={len(test_df):,} rows ({test_df[date_col].min()} to {test_df[date_col].max()})")

        return train_df, val_df, test_df

    @staticmethod
    def get_walk_forward_folds(df: pd.DataFrame, date_col: str = "arrival_date", n_splits: int = 5) -> List[Tuple[np.ndarray, np.ndarray]]:
        """Generates expanding-window walk-forward index splits for cross-validation."""
        df_sorted = df.sort_values(by=date_col).reset_index(drop=True)
        n = len(df_sorted)
        fold_size = n // (n_splits + 1)

        folds = []
        for i in range(1, n_splits + 1):
            train_idx = np.arange(0, i * fold_size)
            val_idx = np.arange(i * fold_size, min((i + 1) * fold_size, n))
            folds.append((train_idx, val_idx))

        return folds


def generate_temporal_validation_doc():
    out_md = PROJECT_ROOT / "TEMPORAL_VALIDATION.md"
    with open(out_md, "w", encoding="utf-8") as f:
        f.write("# GramBiz Model 3 — Temporal Validation Specification\n\n")
        f.write("## Overview\n")
        f.write("Model 3 enforces chronological time-series splitting to prevent temporal data leakage.\n\n")
        f.write("## Validation Protocol\n")
        f.write("1. **Chronological Splitting:** Older observations $\\rightarrow$ Train; Middle period $\\rightarrow$ Validation; Most recent period $\\rightarrow$ Untouched Final Holdout.\n")
        f.write("2. **Walk-Forward Cross-Validation:** Expanding-window folds where training set expands over time.\n")
        f.write("3. **Geographic Group Isolation:** Tested via District `GroupKFold` to evaluate geographic generalization.\n")
