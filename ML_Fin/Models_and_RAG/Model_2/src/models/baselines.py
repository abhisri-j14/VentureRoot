"""
GramBiz Model 2 -- Baseline Models
====================================
Provides baseline models for out-of-sample comparison:
1. DummyRegressor Baseline (Mean predictor)
2. DeterministicIndexBaseline (Formula-based weighted index baseline)
"""

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, RegressorMixin
from sklearn.dummy import DummyRegressor


class DeterministicIndexBaseline(BaseEstimator, RegressorMixin):
    """
    Deterministic Weighted-Index Baseline.
    Computes weighted sum of demographic & economic proxies.
    Used to verify if ML models provide genuine out-of-sample value.
    """

    def __init__(self, weights=None):
        self.weights = weights

    def fit(self, X, y=None):
        """No fitting required; deterministic calculation."""
        return self

    def predict(self, X):
        """Predict weighted sum of normalized columns."""
        if X.ndim == 1:
            X = X.reshape(1, -1)
        # Standardize features to [0, 1] then take mean
        mins = np.min(X, axis=0)
        maxs = np.max(X, axis=0)
        ranges = np.where((maxs - mins) == 0, 1.0, maxs - mins)
        X_scaled = (X - mins) / ranges
        preds = np.mean(X_scaled, axis=1) * 100.0
        return np.clip(preds, 0.0, 100.0)
