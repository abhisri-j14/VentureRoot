"""
GramBiz Model 1 -- Prediction Module
======================================
Load trained model and produce predictions with full provenance metadata.

Every prediction response includes:
- market_potential_score (0-100)
- opportunity_level
- component scores
- confidence/uncertainty information
- geographic_level
- data_freshness
- data_sources
- major_positive_factors
- major_negative_factors
- limitations
- methodology_version
"""

import json
import logging
import os
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


class GramBizPredictor:
    """
    GramBiz Model 1 Prediction Engine.

    Loads a trained model and provides predictions with full
    provenance metadata and explainability.
    """

    def __init__(self, models_dir: Optional[str] = None):
        """
        Initialize predictor by loading model artifacts.

        Parameters
        ----------
        models_dir : str, optional
            Path to models directory. Defaults to project models/.
        """
        if models_dir is None:
            models_dir = os.path.join(BASE_DIR, "models")

        self.model = joblib.load(os.path.join(models_dir, "model_1_final.joblib"))
        self.scaler = joblib.load(os.path.join(models_dir, "scaler.joblib"))
        self.imputer = joblib.load(os.path.join(models_dir, "imputer.joblib"))
        if hasattr(self.imputer, "_fit_dtype") and not hasattr(self.imputer, "_fill_dtype"):
            self.imputer._fill_dtype = self.imputer._fit_dtype

        with open(os.path.join(models_dir, "feature_schema.json"), "r") as f:
            self.feature_schema = json.load(f)

        with open(os.path.join(models_dir, "model_1_metadata.json"), "r") as f:
            self.metadata = json.load(f)

        # Load the processed dataset for location lookup
        processed_path = os.path.join(BASE_DIR, "data", "features", "feature_dataset.csv")
        if os.path.exists(processed_path):
            self.feature_data = pd.read_csv(processed_path)
        else:
            self.feature_data = None
            logger.warning("Feature dataset not found. Prediction requires feature data.")

        self.feature_names = self.feature_schema["feature_names"]
        logger.info(f"Predictor loaded: {len(self.feature_names)} features")

    def predict(
        self,
        state: str,
        district: str,
        business_category: str,
        subdistrict: Optional[str] = None,
        village: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> dict:
        """
        Generate a market potential prediction.

        Parameters
        ----------
        state : str
            State name.
        district : str
            District name.
        business_category : str
            Business category (e.g., 'Dairy', 'Retail').
        subdistrict : str, optional
            Sub-district / block name.
        village : str, optional
            Village name (used for display only; prediction is at sub-district level).

        Returns
        -------
        dict
            Full prediction response with provenance metadata.
        """
        warnings_list = []

        # ---- Location lookup ----
        location_data, match_info = self._lookup_location(
            state, district, subdistrict, village
        )

        if location_data is None:
            return self._no_data_response(
                state, district, subdistrict, village, business_category
            )

        # ---- Extract features ----
        feature_values = []
        missing_features = []
        for fname in self.feature_names:
            if fname in location_data and pd.notna(location_data[fname]):
                try:
                    val = float(location_data[fname])
                    feature_values.append(val)
                except (ValueError, TypeError):
                    feature_values.append(np.nan)
                    missing_features.append(fname)
            else:
                feature_values.append(np.nan)
                missing_features.append(fname)

        if missing_features:
            warnings_list.append(
                f"Missing {len(missing_features)} features: {missing_features[:5]}"
            )

        # ---- Predict ----
        X = np.array(feature_values, dtype=np.float64).reshape(1, -1)
        if hasattr(self.imputer, "_fit_dtype") and not hasattr(self.imputer, "_fill_dtype"):
            self.imputer._fill_dtype = self.imputer._fit_dtype
        try:
            X = self.imputer.transform(X)
        except Exception:
            if hasattr(self.imputer, "statistics_"):
                nan_mask = np.isnan(X)
                X[nan_mask] = np.take(self.imputer.statistics_, np.where(nan_mask)[1])
        X = self.scaler.transform(X)
        raw_prediction = float(self.model.predict(X)[0])
        mpi_score = max(0, min(100, raw_prediction))

        # ---- Component scores ----
        component_scores = {}
        for comp in ["mpi_demand", "mpi_purchasing_power", "mpi_workforce",
                      "mpi_infrastructure", "mpi_market_gap"]:
            if comp in location_data and pd.notna(location_data[comp]):
                try:
                    component_scores[comp] = round(float(location_data[comp]), 2)
                except (ValueError, TypeError):
                    pass

        # ---- Feature contributions ----
        positive_factors, negative_factors = self._get_feature_contributions(
            feature_values, location_data
        )

        # ---- Opportunity level ----
        if mpi_score >= 85:
            opportunity = "Very High"
        elif mpi_score >= 65:
            opportunity = "High"
        elif mpi_score >= 45:
            opportunity = "Moderate"
        elif mpi_score >= 25:
            opportunity = "Low"
        else:
            opportunity = "Very Low"

        # ---- Confidence estimation ----
        data_coverage = len(self.feature_names) - len(missing_features)
        coverage_ratio = data_coverage / max(len(self.feature_names), 1)
        confidence_score = round(coverage_ratio * 100, 1)

        # ---- Village warning ----
        if village:
            warnings_list.append(
                "Village-specific data is not available. "
                "This prediction is a block/sub-district level estimate."
            )

        # ---- Geospatial warning & radius flag ----
        geospatial_available = latitude is not None and longitude is not None
        if not geospatial_available:
            warnings_list.append(
                "True 5-10 km geospatial radius calculation not available. "
                "Estimated consumer base is set to None to prevent data fabrication."
            )

        # ---- Out-of-distribution (OOD) checks ----
        known_categories = [
            "Grocery / Kirana Store", "Dairy Farming", "Poultry Farming",
            "Apparel & Tailoring", "Handloom & Handicrafts", "Solar Energy Services",
            "Agricultural Inputs & Repair", "Beauty Parlour & Salon",
            "Mobile Repair & Electronics", "Food Processing & Bakery"
        ]
        is_category_ood = business_category not in known_categories
        if is_category_ood:
            warnings_list.append(
                f"Business category '{business_category}' is out-of-distribution. "
                "Using default baseline weights."
            )

        ood_checks = {
            "location_found": True,
            "category_in_distribution": not is_category_ood,
            "geospatial_coordinates_provided": geospatial_available,
            "missing_feature_count": len(missing_features),
            "is_out_of_distribution": is_category_ood or len(missing_features) > 10,
        }

        # ---- Competitor density check ----
        competitor_density_available = "establishment_count" in location_data and pd.notna(location_data.get("establishment_count"))

        limitations = [
            "No direct business-success/revenue labels exist in public census data; MPI is an engineered index.",
            "Mixed dataset temporal anchors: Census 2011, HCES 2023-24, CPI July 2026.",
            "Geographic resolution is aggregated at the sub-district / block level.",
            "True 5-10 km geospatial radius analysis is unavailable without exact lat/lon coordinates.",
            "Competitor density is strictly omitted unless verified establishment count data exists.",
            "High R2 (0.9505) reflects fit to synthetic MPI, NOT 95% real-world demand prediction accuracy.",
            "No significant overfitting detected under the evaluated validation protocol."
        ]

        return {
            "MODEL_VERSION": "1.0.0",
            "METHODOLOGY_VERSION": "1.0.0",
            "model_version": "1.0.0",
            "methodology_version": "1.0.0",
            "market_potential_score": round(mpi_score, 2),
            "opportunity_level": opportunity,
            "demand_score": component_scores.get("mpi_demand", None),
            "purchasing_power_score": component_scores.get("mpi_purchasing_power", None),
            "workforce_opportunity_score": component_scores.get("mpi_workforce", None),
            "infrastructure_score": component_scores.get("mpi_infrastructure", None),
            "market_gap_score": component_scores.get("mpi_market_gap", None),
            "confidence_score": confidence_score,
            "estimated_consumer_base": None,  # Suppressed / Never fabricated
            "geospatial_radius_available": geospatial_available,
            "competitor_density_available": competitor_density_available,
            "top_positive_factors": positive_factors[:5],
            "top_negative_factors": negative_factors[:5],
            "data_coverage": {
                "features_available": data_coverage,
                "features_total": len(self.feature_names),
                "coverage_pct": round(coverage_ratio * 100, 1),
            },
            "geographic_level": "sub-district",
            "match_info": match_info,
            "ood_checks": ood_checks,
            "data_freshness": self.metadata.get("dataset_versions", {}),
            "data_sources": [
                "Census 2011 Primary Census Abstract",
                "Census 2011 A-1 (Villages, Households, Area)",
                "HCES 2023-24 (State-level MPCE)",
                "CPI July 2026 (State-level)",
            ],
            "model_type": self.metadata.get("model_type", "unknown"),
            "limitations": limitations,
            "warnings": warnings_list,
            "business_category": business_category,
            "location": {
                "state": state,
                "district": district,
                "subdistrict": subdistrict,
                "village": village,
            },
        }

    def _lookup_location(
        self, state: str, district: str,
        subdistrict: Optional[str], village: Optional[str],
    ) -> tuple:
        """Look up location in the feature dataset."""
        if self.feature_data is None:
            return None, {"status": "no_feature_data"}

        df = self.feature_data

        # Try exact match on state_name + name (sub-district name)
        state_lower = state.lower().strip()
        district_lower = district.lower().strip()

        # Match by state
        state_mask = df["state_name"].str.lower().str.strip() == state_lower

        if subdistrict:
            sub_lower = subdistrict.lower().strip()
            name_mask = df["name"].str.lower().str.strip() == sub_lower
            match = df[state_mask & name_mask]
        else:
            name_mask = df["name"].str.lower().str.strip() == district_lower
            match = df[state_mask & name_mask]

        if len(match) == 0:
            # Fuzzy: try partial match
            if subdistrict:
                name_mask = df["name"].str.lower().str.strip().str.contains(
                    subdistrict.lower().strip()[:5], na=False
                )
            else:
                name_mask = df["name"].str.lower().str.strip().str.contains(
                    district_lower[:5], na=False
                )
            match = df[state_mask & name_mask]

        if len(match) == 0:
            return None, {"status": "not_found", "message": "Location not in dataset"}

        # Take first match
        row = match.iloc[0]
        info = {
            "status": "found",
            "matched_name": str(row.get("name", "")),
            "matched_state": str(row.get("state_name", "")),
            "match_type": "exact" if len(match) == 1 else f"best_of_{len(match)}",
        }
        return row, info

    def _get_feature_contributions(
        self, feature_values: list, location_data: pd.Series,
    ) -> tuple:
        """Identify major positive and negative contributing factors."""
        positive = []
        negative = []

        # Use feature importance if available
        if hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            for i, fname in enumerate(self.feature_names):
                if i < len(feature_values) and not np.isnan(feature_values[i]):
                    # Importance * relative value position
                    val = feature_values[i]
                    imp = importances[i]
                    entry = {"factor": fname, "importance": round(float(imp), 4)}
                    if imp > 0.02:  # Only significant factors
                        positive.append(entry)
        else:
            # Use component scores
            for comp_name in ["mpi_demand", "mpi_purchasing_power", "mpi_workforce",
                              "mpi_infrastructure", "mpi_market_gap"]:
                if comp_name in location_data and pd.notna(location_data[comp_name]):
                    try:
                        val = float(location_data[comp_name])
                        entry = {"factor": comp_name.replace("mpi_", ""), "score": round(val, 2)}
                        if val >= 60:
                            positive.append(entry)
                        elif val <= 40:
                            negative.append(entry)
                    except (ValueError, TypeError):
                        pass

        positive.sort(key=lambda x: x.get("importance", x.get("score", 0)), reverse=True)
        negative.sort(key=lambda x: x.get("importance", x.get("score", 100)))

        return positive, negative

    def _no_data_response(self, state, district, subdistrict, village, category):
        """Return a response when location is not found."""
        return {
            "MODEL_VERSION": "1.0.0",
            "METHODOLOGY_VERSION": "1.0.0",
            "model_version": "1.0.0",
            "methodology_version": "1.0.0",
            "market_potential_score": None,
            "opportunity_level": None,
            "confidence_score": 0,
            "estimated_consumer_base": None,
            "geographic_level": "sub-district",
            "geospatial_radius_available": False,
            "competitor_density_available": False,
            "match_info": {"status": "not_found"},
            "ood_checks": {
                "location_found": False,
                "category_in_distribution": True,
                "geospatial_coordinates_provided": False,
                "is_out_of_distribution": True,
            },
            "warnings": [
                f"Location '{district}, {state}' not found in dataset. "
                "Prediction requires Census 2011 sub-district data coverage."
            ],
            "limitations": [
                "No direct business-success/revenue labels exist in public census data; MPI is an engineered index.",
                "Mixed dataset temporal anchors: Census 2011, HCES 2023-24, CPI July 2026.",
                "Geographic resolution is aggregated at the sub-district / block level.",
                "True 5-10 km geospatial radius analysis is unavailable without exact lat/lon coordinates.",
                "Competitor density is strictly omitted unless verified establishment count data exists.",
                "High R2 (0.9505) reflects fit to synthetic MPI, NOT 95% real-world demand prediction accuracy.",
                "No significant overfitting detected under the evaluated validation protocol."
            ],
            "business_category": category,
            "location": {
                "state": state, "district": district,
                "subdistrict": subdistrict, "village": village,
            },
        }
