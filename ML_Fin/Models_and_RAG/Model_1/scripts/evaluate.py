"""
GramBiz Model 1 -- Standalone Model Evaluation Script
======================================================
Loads saved model and metadata, runs test set evaluation,
and prints diagnostic tables to terminal.
"""

import json
import logging
import os
import sys

import joblib
import pandas as pd

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.models.evaluate import calculate_regression_metrics, generate_evaluation_report

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def main():
    model_path = os.path.join(PROJECT_ROOT, "models", "model_1_final.joblib")
    metadata_path = os.path.join(PROJECT_ROOT, "models", "model_1_metadata.json")
    feature_path = os.path.join(PROJECT_ROOT, "data", "features", "features_processed.csv")
    
    if not os.path.exists(model_path):
        logger.error(f"Model file not found at {model_path}. Run scripts/train.py first.")
        sys.exit(1)
        
    logger.info(f"Loading trained model from {model_path}...")
    model = joblib.load(model_path)
    
    with open(metadata_path, "r") as f:
        metadata = json.load(f)
        
    logger.info("Model Metadata:")
    logger.info(f"  Best Model: {metadata.get('model_type')}")
    logger.info(f"  Training CV Mean MAE: {metadata.get('cross_validation_metrics', {}).get('cv_mean_mae', 'N/A')}")
    logger.info(f"  Training Date: {metadata.get('training_date')}")
    
    if os.path.exists(feature_path):
        logger.info(f"Evaluating model on processed feature dataset ({feature_path})...")
        df = pd.read_csv(feature_path)
        X = df[metadata["feature_names"]]
        y = df[metadata["target_name"]]
        
        preds = model.predict(X)
        metrics = calculate_regression_metrics(y, preds)
        
        print("\n=======================================================")
        print("  GRAMBIZ MODEL 1 — FULL DATASET EVALUATION METRICS")
        print("=======================================================")
        for k, v in metrics.items():
            print(f"  {k:20s}: {v:.4f}")
        print("=======================================================\n")
    else:
        logger.warning(f"Feature dataset not found at {feature_path}. Skipped dataset metrics calculation.")


if __name__ == "__main__":
    main()
