"""
GramBiz Model 1 -- SHAP Explainability Module
================================================
Provides global feature importance and local instance explanations
using SHAP (SHapley Additive exPlanations).
"""

import logging
import os
from typing import Any, Dict, List, Optional

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False
    logger.warning("SHAP package not found. Explainability module will use tree feature importances as fallback.")


def compute_shap_explanations(
    model: Any,
    X_train: pd.DataFrame,
    X_sample: pd.DataFrame,
    output_dir: str = "reports/explainability"
) -> Dict[str, Any]:
    """
    Computes global SHAP values for a sample of the dataset and saves summary plots.
    
    Args:
        model: Trained model (Tree-based or pipeline)
        X_train: Background dataset for TreeExplainer/KernelExplainer
        X_sample: Dataset to explain (typically test or validation set)
        output_dir: Directory where SHAP plots will be saved
        
    Returns:
        Dict containing top feature importance rankings and plot paths.
    """
    os.makedirs(output_dir, exist_ok=True)
    results = {
        "global_importance": {},
        "plot_paths": {}
    }
    
    # Extract estimator if inside pipeline
    estimator = model
    if hasattr(model, "named_steps"):
        estimator = model.named_steps.get("model", model)
    elif hasattr(model, "best_estimator_"):
        estimator = model.best_estimator_
        if hasattr(estimator, "named_steps"):
            estimator = estimator.named_steps.get("model", estimator)

    feature_names = list(X_sample.columns)
    
    if not HAS_SHAP:
        # Fallback to feature_importances_
        if hasattr(estimator, "feature_importances_"):
            importances = estimator.feature_importances_
            imp_df = pd.DataFrame({
                "feature": feature_names,
                "importance": importances
            }).sort_values("importance", ascending=False)
            
            results["global_importance"] = imp_df.set_index("feature")["importance"].to_dict()
            
            # Save simple plot
            fig, ax = plt.subplots(figsize=(10, 6))
            imp_df.head(15).plot.barh(x="feature", y="importance", ax=ax, color="#1e40af")
            plt.gca().invert_yaxis()
            plt.title("Feature Importance (Tree-based Baseline)")
            plt.tight_layout()
            plot_path = os.path.join(output_dir, "feature_importance_fallback.png")
            plt.savefig(plot_path, dpi=150)
            plt.close()
            results["plot_paths"]["importance_bar"] = plot_path
            
        return results

    try:
        # Use TreeExplainer if tree-based model
        explainer = shap.Explainer(estimator, X_train)
        shap_values = explainer(X_sample)
        
        # Summary Plot
        plt.figure(figsize=(10, 8))
        shap.summary_plot(shap_values, X_sample, show=False)
        summary_path = os.path.join(output_dir, "shap_summary_plot.png")
        plt.savefig(summary_path, dpi=200, bbox_inches="tight")
        plt.close()
        results["plot_paths"]["shap_summary"] = summary_path
        
        # Bar Plot
        plt.figure(figsize=(10, 8))
        shap.plots.bar(shap_values, show=False)
        bar_path = os.path.join(output_dir, "shap_bar_plot.png")
        plt.savefig(bar_path, dpi=200, bbox_inches="tight")
        plt.close()
        results["plot_paths"]["shap_bar"] = bar_path
        
        # Global mean |SHAP| values
        mean_abs_shap = np.abs(shap_values.values).mean(axis=0)
        global_imp = pd.Series(mean_abs_shap, index=feature_names).sort_values(ascending=False)
        results["global_importance"] = global_imp.to_dict()
        
        logger.info(f"Successfully generated SHAP plots at {output_dir}")
        
    except Exception as e:
        logger.error(f"Failed to compute SHAP values: {str(e)}")
        # Fallback to feature_importances_
        if hasattr(estimator, "feature_importances_"):
            importances = estimator.feature_importances_
            imp_df = pd.DataFrame({
                "feature": feature_names,
                "importance": importances
            }).sort_values("importance", ascending=False)
            results["global_importance"] = imp_df.set_index("feature")["importance"].to_dict()

    return results


def explain_single_prediction(
    model: Any,
    instance_df: pd.DataFrame,
    background_df: pd.DataFrame
) -> Dict[str, float]:
    """
    Computes local feature contributions for a single location prediction.
    
    Returns:
        Dict mapping feature names to their directional impact on the score.
    """
    estimator = model
    if hasattr(model, "named_steps"):
        estimator = model.named_steps.get("model", model)

    feature_names = list(instance_df.columns)
    
    if HAS_SHAP:
        try:
            explainer = shap.Explainer(estimator, background_df)
            shap_vals = explainer(instance_df)
            val_vector = shap_vals.values[0]
            return dict(zip(feature_names, val_vector.tolist()))
        except Exception:
            pass
            
    # Fallback to normalized feature importances * feature values standard score
    if hasattr(estimator, "feature_importances_"):
        imps = estimator.feature_importances_
        bg_mean = background_df.mean()
        bg_std = background_df.std().replace(0, 1.0)
        z_scores = (instance_df.iloc[0] - bg_mean) / bg_std
        contributions = imps * z_scores
        return contributions.to_dict()
        
    return {f: 0.0 for f in feature_names}
