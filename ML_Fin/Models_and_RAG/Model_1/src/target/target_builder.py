"""
GramBiz Model 1 -- Market Potential Index (MPI) Target Builder
================================================================
Constructs the Market Potential Index as a composite score from
observable indicators. This is NOT a supervised label.

The MPI is a transparent, documented index representing relative
market opportunity for a business category at the sub-district level.

It does NOT predict:
- Business success or failure
- Revenue or profit
- Actual consumer demand
- Probability of any business outcome

Components:
1. Demand Proxy (population, households, settlement density)
2. Purchasing Power Proxy (MPCE, CPI)
3. Workforce Opportunity (category-relevant workforce ratios)
4. Infrastructure/Development Proxy (literacy, density, villages)
5. Market Gap Proxy (inverse of existing business activity indicators)

Each component is min-max normalized to [0, 100] within its distribution.
The final MPI is a weighted sum of components.
"""

import logging
from typing import Dict, List, Optional, Tuple

import pandas as pd
import numpy as np
from scipy import stats as sp_stats

from src.features.category_features import (
    get_category_weights,
    get_category_relevant_workforce_columns,
)

logger = logging.getLogger(__name__)


def _minmax_normalize(series: pd.Series, lower: float = 0, upper: float = 100) -> pd.Series:
    """Min-max normalize a series to [lower, upper]. NaN preserved."""
    s_min = series.min()
    s_max = series.max()
    if s_max == s_min:
        return pd.Series(50.0, index=series.index)  # constant -> midpoint
    return lower + (series - s_min) / (s_max - s_min) * (upper - lower)


def compute_demand_proxy(df: pd.DataFrame) -> pd.Series:
    """
    Demand Proxy: Population-based demand opportunity.
    Higher population + households + settlement density = higher demand potential.
    """
    components = []
    if "log_population" in df.columns:
        components.append(_minmax_normalize(df["log_population"]))
    if "log_households" in df.columns:
        components.append(_minmax_normalize(df["log_households"]))
    if "household_density" in df.columns:
        components.append(_minmax_normalize(df["household_density"]))
    if "settlement_density" in df.columns:
        components.append(_minmax_normalize(df["settlement_density"]))

    if not components:
        return pd.Series(50.0, index=df.index)
    return pd.concat(components, axis=1).mean(axis=1)


def compute_purchasing_power_proxy(df: pd.DataFrame) -> pd.Series:
    """
    Purchasing Power Proxy: Consumption capacity of the area.
    Higher MPCE = higher spending ability.
    Note: MPCE is state-level, so all sub-districts in the same state
    get the same MPCE value. This is a documented limitation.
    """
    components = []
    if "log_mpce_rural" in df.columns:
        components.append(_minmax_normalize(df["log_mpce_rural"]))
    if "cpi_rural" in df.columns:
        # Higher CPI = higher price level = potentially higher economic activity
        cpi_valid = df["cpi_rural"].replace(0, np.nan)
        components.append(_minmax_normalize(cpi_valid))

    if not components:
        return pd.Series(50.0, index=df.index)
    return pd.concat(components, axis=1).mean(axis=1)


def compute_workforce_opportunity(
    df: pd.DataFrame,
    category: str = "default",
) -> pd.Series:
    """
    Workforce Opportunity: Availability of category-relevant workforce.
    Different business categories weight different workforce types.
    """
    # Get category-relevant workforce columns
    relevant_cols = get_category_relevant_workforce_columns(category)
    if not relevant_cols:
        relevant_cols = ["worker_participation_rate", "main_worker_ratio"]

    components = []
    for col in relevant_cols:
        if col in df.columns:
            components.append(_minmax_normalize(df[col]))

    # Always include general worker participation
    if "worker_participation_rate" in df.columns:
        components.append(_minmax_normalize(df["worker_participation_rate"]))

    if not components:
        return pd.Series(50.0, index=df.index)
    return pd.concat(components, axis=1).mean(axis=1)


def compute_infrastructure_proxy(df: pd.DataFrame) -> pd.Series:
    """
    Infrastructure/Development Proxy: Indicators of development level.
    Higher literacy, population density, village count = more developed.
    """
    components = []
    if "literacy_rate" in df.columns:
        components.append(_minmax_normalize(df["literacy_rate"]))
    if "population_density" in df.columns:
        # Log-transform density to reduce extreme skewness
        log_density = np.log1p(df["population_density"])
        components.append(_minmax_normalize(log_density))
    if "villages_inhabited" in df.columns:
        components.append(_minmax_normalize(np.log1p(df["villages_inhabited"])))

    if not components:
        return pd.Series(50.0, index=df.index)
    return pd.concat(components, axis=1).mean(axis=1)


def compute_market_gap_proxy(df: pd.DataFrame) -> pd.Series:
    """
    Market Gap Proxy: Inverse of existing business activity indicators.
    Lower existing HH industry / other workers = potentially more market gap.

    IMPORTANT: This is NOT a competitor count. We do not have actual
    business/establishment data. This uses workforce composition as a
    rough proxy for existing economic activity.
    """
    components = []

    # Inverse of household industry ratio: less existing HH industry = more opportunity
    if "hh_industry_ratio" in df.columns:
        inv_hh = 1 - df["hh_industry_ratio"].fillna(0)
        components.append(_minmax_normalize(inv_hh))

    # Inverse of other worker ratio (proxy for existing service/business activity)
    if "other_worker_ratio" in df.columns:
        inv_other = 1 - df["other_worker_ratio"].fillna(0)
        components.append(_minmax_normalize(inv_other))

    if not components:
        return pd.Series(50.0, index=df.index)
    return pd.concat(components, axis=1).mean(axis=1)


def build_mpi(
    df: pd.DataFrame,
    category: str = "default",
    custom_weights: Optional[Dict[str, float]] = None,
) -> pd.DataFrame:
    """
    Build the Market Potential Index (MPI) for a specific business category.

    Parameters
    ----------
    df : pd.DataFrame
        Feature-engineered dataset.
    category : str
        Business category for weight selection.
    custom_weights : dict, optional
        Override category weights with custom values.

    Returns
    -------
    pd.DataFrame
        Original DataFrame with added MPI component and final score columns.
    """
    logger.info(f"Building MPI for category: {category}")
    df = df.copy()

    # Get weights
    if custom_weights is not None:
        weights = custom_weights
    else:
        weights = get_category_weights(category)

    logger.info(f"  MPI weights: {weights}")

    # Compute components
    df["mpi_demand"] = compute_demand_proxy(df)
    df["mpi_purchasing_power"] = compute_purchasing_power_proxy(df)
    df["mpi_workforce"] = compute_workforce_opportunity(df, category)
    df["mpi_infrastructure"] = compute_infrastructure_proxy(df)
    df["mpi_market_gap"] = compute_market_gap_proxy(df)

    # Weighted combination
    df["market_potential_index"] = (
        weights["demand_proxy"] * df["mpi_demand"]
        + weights["purchasing_power_proxy"] * df["mpi_purchasing_power"]
        + weights["workforce_opportunity"] * df["mpi_workforce"]
        + weights["infrastructure_development"] * df["mpi_infrastructure"]
        + weights["market_gap_proxy"] * df["mpi_market_gap"]
    )

    # Clip to [0, 100]
    df["market_potential_index"] = df["market_potential_index"].clip(0, 100)

    # Add opportunity level classification
    df["opportunity_level"] = pd.cut(
        df["market_potential_index"],
        bins=[0, 25, 45, 65, 85, 100],
        labels=["Very Low", "Low", "Moderate", "High", "Very High"],
        include_lowest=True,
    )

    logger.info(f"  MPI stats: mean={df['market_potential_index'].mean():.2f}, "
                f"std={df['market_potential_index'].std():.2f}, "
                f"min={df['market_potential_index'].min():.2f}, "
                f"max={df['market_potential_index'].max():.2f}")

    return df


def sensitivity_analysis(
    df: pd.DataFrame,
    category: str = "default",
    delta: float = 0.05,
) -> pd.DataFrame:
    """
    Sensitivity analysis: vary each MPI weight by +/- delta and measure impact.

    Parameters
    ----------
    df : pd.DataFrame
        Feature-engineered dataset (without MPI columns).
    category : str
        Base category for weights.
    delta : float
        Amount to vary each weight (+/-).

    Returns
    -------
    pd.DataFrame
        Report showing ranking stability under weight perturbation.
    """
    logger.info(f"Running sensitivity analysis (delta={delta})...")

    base_weights = get_category_weights(category)
    base_df = build_mpi(df.copy(), category)
    base_ranking = base_df["market_potential_index"].rank()

    results = []
    for component in base_weights:
        for direction in [+delta, -delta]:
            perturbed = dict(base_weights)
            perturbed[component] += direction

            # Re-normalize to sum to 1.0
            total = sum(perturbed.values())
            perturbed = {k: v / total for k, v in perturbed.items()}

            perturbed_df = build_mpi(df.copy(), custom_weights=perturbed)
            perturbed_ranking = perturbed_df["market_potential_index"].rank()

            # Spearman rank correlation
            spearman, _ = sp_stats.spearmanr(base_ranking, perturbed_ranking)

            # Mean absolute score change
            score_change = (
                perturbed_df["market_potential_index"] - base_df["market_potential_index"]
            ).abs().mean()

            results.append({
                "component": component,
                "direction": f"{direction:+.2f}",
                "spearman_rank_correlation": round(spearman, 4),
                "mean_abs_score_change": round(score_change, 4),
                "max_score_change": round(
                    (perturbed_df["market_potential_index"] - base_df["market_potential_index"]).abs().max(), 4
                ),
            })

    report = pd.DataFrame(results)
    logger.info(f"Sensitivity analysis complete: {len(results)} perturbations tested")
    return report


def ablation_analysis(
    df: pd.DataFrame,
    category: str = "default",
) -> pd.DataFrame:
    """
    Ablation analysis: remove each MPI component and measure impact.

    Returns
    -------
    pd.DataFrame
        Report showing which components are most important for ranking.
    """
    logger.info("Running ablation analysis...")

    base_weights = get_category_weights(category)
    base_df = build_mpi(df.copy(), category)
    base_ranking = base_df["market_potential_index"].rank()

    results = []
    for component in base_weights:
        # Set this component's weight to 0 and re-normalize
        ablated = dict(base_weights)
        ablated[component] = 0
        total = sum(ablated.values())
        if total > 0:
            ablated = {k: v / total for k, v in ablated.items()}
        else:
            continue

        ablated_df = build_mpi(df.copy(), custom_weights=ablated)
        ablated_ranking = ablated_df["market_potential_index"].rank()

        spearman, _ = sp_stats.spearmanr(base_ranking, ablated_ranking)
        score_change = (
            ablated_df["market_potential_index"] - base_df["market_potential_index"]
        ).abs().mean()

        results.append({
            "removed_component": component,
            "original_weight": base_weights[component],
            "spearman_rank_correlation": round(spearman, 4),
            "mean_abs_score_change": round(score_change, 4),
            "ranking_impact": "High" if spearman < 0.95 else "Low",
        })

    report = pd.DataFrame(results)
    report = report.sort_values("spearman_rank_correlation")
    logger.info("Ablation analysis complete")
    return report
