"""
GramBiz Model 1 -- Visualization Generator
============================================
Generates static chart assets for reports, presentations, and dashboard fallback.
"""

import logging
import os
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def generate_all_charts():
    output_dir = os.path.join(PROJECT_ROOT, "reports", "figures")
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Target Distribution Chart
    features_path = os.path.join(PROJECT_ROOT, "data", "features", "features_processed.csv")
    if os.path.exists(features_path):
        df = pd.read_csv(features_path)
        if "market_potential_index" in df.columns:
            plt.figure(figsize=(9, 5))
            plt.hist(df["market_potential_index"], bins=30, color="#2563eb", edgecolor="#1e40af", alpha=0.8)
            plt.title("Distribution of Market Potential Index (MPI)", fontsize=14, fontweight="bold")
            plt.xlabel("MPI Score (0-100)", fontsize=12)
            plt.ylabel("Gram Panchayat Count", fontsize=12)
            plt.grid(axis="y", linestyle="--", alpha=0.5)
            plt.tight_layout()
            plt.savefig(os.path.join(output_dir, "mpi_distribution.png"), dpi=200)
            plt.close()
            logger.info("Generated mpi_distribution.png")

            # 2. Opportunity Level Breakdown
            if "opportunity_level" in df.columns:
                counts = df["opportunity_level"].value_counts()
                colors = ["#22c55e", "#3b82f6", "#eab308", "#ef4444"]
                plt.figure(figsize=(7, 5))
                counts.plot.bar(color=colors[:len(counts)], edgecolor="#000")
                plt.title("Opportunity Tier Count", fontsize=14, fontweight="bold")
                plt.xlabel("Tier", fontsize=12)
                plt.ylabel("Gram Panchayat Count", fontsize=12)
                plt.xticks(rotation=0)
                plt.tight_layout()
                plt.savefig(os.path.join(output_dir, "opportunity_tiers.png"), dpi=200)
                plt.close()
                logger.info("Generated opportunity_tiers.png")

    logger.info(f"All visualizations successfully saved to {output_dir}")


if __name__ == "__main__":
    generate_all_charts()
