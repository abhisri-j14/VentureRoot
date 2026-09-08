"""
GramBiz Model 2 -- Inference & Opportunity Analysis Engine
============================================================
Provides single-location and multi-category inference, out-of-distribution (OOD) checks,
data completeness scoring, and structured output formatting for Module 2.
"""

import json
import logging
import os
from typing import Any, Dict, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd

from src.config import (
    CANONICAL_CATEGORIES,
    FEATURE_METADATA_DIR,
    METHODOLOGY_VERSION,
    MODEL_VERSION,
    MODELS_DIR,
    PROCESSED_DATA_DIR,
)
from src.scoring.opportunity_engine import rank_business_categories

logger = logging.getLogger(__name__)

# Score interpretation bands
SCORE_BANDS = [
    (0.0, 20.0, "Very Low Opportunity"),
    (20.0, 40.0, "Low Opportunity"),
    (40.0, 60.0, "Moderate Opportunity"),
    (60.0, 80.0, "High Opportunity"),
    (80.0, 100.0, "Very High Opportunity")
]

MODEL_LIMITATIONS = [
    "The Viability & Opportunity Score is a relative analytical index, NOT a direct prediction or guarantee of business success, revenue, or survival.",
    "5-10 km geographic radius consumer numbers and micro-level competitor counts are unobserved in available datasets; geospatial_radius_available is set to false.",
    "Hyper-local analysis relies on sub-district level Census 2011 aggregations and district-level MSME/ASI registrations.",
    "Real-world business outcomes depend on unobserved micro-factors such as individual managerial skill, capital structure, and hyper-local foot traffic."
]


class Model2InferenceEngine:
    """
    Production inference engine for Model 2.
    Handles loading model artifacts, geography lookup, feature transformation, OOD safety,
    scoring, category ranking, and explicit data provenance warnings.
    """

    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = []
        self.metadata = {}
        self.geography_master = None
        self.is_loaded = False
        self._load_artifacts()

    def _load_artifacts(self):
        """Load model weights, feature lists, and geography database."""
        try:
            model_path = os.path.join(MODELS_DIR, "champion_model.joblib")
            scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
            meta_path = os.path.join(MODELS_DIR, "model_2_metadata.json")
            geo_path = os.path.join(PROCESSED_DATA_DIR, "geography_master.csv")

            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            if os.path.exists(meta_path):
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                self.feature_names = self.metadata.get("feature_names", [])
            if os.path.exists(geo_path):
                self.geography_master = pd.read_csv(geo_path, dtype={"state_code": str, "district_code": str, "subdistrict_code": str})

            self.is_loaded = True
            logger.info("Model 2 Inference Engine initialized successfully.")
        except Exception as e:
            logger.warning(f"Model 2 Inference Engine initialized in fallback mode: {e}")

    def check_ood(self, input_features: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Check if input features are out-of-distribution (OOD).

        Parameters
        ----------
        input_features : dict
            Location metrics dictionary.

        Returns
        -------
        is_ood : bool
        warnings : list of str
        """
        warnings = []
        is_ood = False

        # State / District presence check
        state = input_features.get("state_name", "")
        if self.geography_master is not None and state:
            known_states = self.geography_master["state_name"].unique()
            if state not in known_states:
                is_ood = True
                warnings.append(f"Unseen state '{state}'. Prediction quality may be lower.")

        # Missing key features check
        tot_pop = input_features.get("total_population") or input_features.get("population", 0)
        if tot_pop <= 0:
            is_ood = True
            warnings.append("Total population missing or zero. Score calculated using fallback defaults.")

        # Extreme metric values check
        literacy = input_features.get("literacy_rate", 0.5)
        if literacy < 0.1 or literacy > 1.0:
            is_ood = True
            warnings.append("Literacy rate outside normal training range [0.10, 1.00].")

        return is_ood, warnings

    def calculate_data_completeness(self, input_features: Dict[str, Any]) -> float:
        """Calculate data completeness score from 0.0 to 1.0."""
        expected_keys = [
            "total_population", "literacy_rate", "main_work_rate",
            "agricultural_worker_rate", "non_agricultural_worker_rate",
            "household_size", "msme_density_per_10k_pop"
        ]
        present = sum(1 for k in expected_keys if k in input_features and input_features[k] is not None and not np.isnan(float(input_features[k] or 0)))
        return round(present / len(expected_keys), 2)

    def analyze_location(
        self,
        state_name: str,
        district_name: str,
        subdistrict_name: Optional[str] = None,
        business_category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perform hyper-local opportunity analysis and category ranking for a location.

        Parameters
        ----------
        state_name : str
        district_name : str
        subdistrict_name : str, optional
        business_category : str, optional

        Returns
        -------
        dict
            Structured API prediction response.
        """
        # Lookup geography record
        location_record = None
        data_sources = ["Census PCA 2011", "Udyam MSME Registrations", "ASI Factory Statistics"]
        warnings = []

        # Canonical District Aliases (Census 2011 <-> Modern / Reorganized Districts)
        DISTRICT_ALIASES = {
            "PURBA BARDHAMAN": "BARDDHAMAN",
            "PASCHIM BARDHAMAN": "BARDDHAMAN",
            "BURDWAN": "BARDDHAMAN",
            "EAST BURDWAN": "BARDDHAMAN",
            "WEST BURDWAN": "BARDDHAMAN",
            "HOOGHLY": "HUGLI",
            "HOWRAH": "HAORA",
            "NORTH 24 PARGANAS": "NORTH TWENTY FOUR PARGANAS",
            "SOUTH 24 PARGANAS": "SOUTH TWENTY FOUR PARGANAS",
            "DARJEELING": "DARJILING",
            "GURGAON": "GURUGRAM",
            "GURUGRAM": "GURGAON",
            "BANGALORE URBAN": "BENGALURU URBAN",
            "BANGALORE RURAL": "BENGALURU RURAL",
            "BENGALURU URBAN": "BANGALORE",
            "BENGALURU RURAL": "BANGALORE RURAL",
            "PRAYAGRAJ": "ALLAHABAD",
            "ALLAHABAD": "ALLAHABAD",
            "PUNE": "PUNE",
            "NASHIK": "NASHIK",
            "PATNA": "PATNA",
            "DANAPUR": "PATNA",
            "MEDINIPUR": "PASCHIM MEDINIPUR",
        }

        # Category Normalization Map to Canonical 15 Categories
        CATEGORY_NORMALIZATION_MAP = {
            "dairy & milk processing": "Dairy",
            "dairy": "Dairy",
            "dairy farming": "Dairy",
            "milk processing": "Dairy",
            "retail": "Retail",
            "grocery / kirana store": "Retail",
            "kirana store": "Retail",
            "grocery": "Retail",
            "textiles": "Textiles",
            "apparel & tailoring": "Textiles",
            "food processing": "Food Processing",
            "food processing & bakery": "Food Processing",
            "agriculture": "Agriculture",
            "agricultural inputs & repair": "Agriculture",
            "fisheries": "Fisheries",
            "poultry": "Poultry",
            "poultry farming": "Poultry",
            "handicrafts": "Handicrafts",
            "handloom & handicrafts": "Handicrafts",
            "manufacturing": "Manufacturing",
            "services": "Services",
            "solar energy services": "Services",
            "digital services": "Services",
            "repair/maintenance": "Repair/Maintenance",
            "repair & maintenance": "Repair/Maintenance",
            "mobile repair & electronics": "Repair/Maintenance",
            "transport": "Transport",
            "transportation": "Transport",
            "hospitality": "Hospitality",
            "personal services": "Personal Services",
            "beauty parlour & salon": "Personal Services",
            "beauty parlour / service business": "Personal Services",
            "beauty parlour": "Personal Services",
            "salon": "Personal Services",
        }

        norm_cat_key = str(business_category or "").strip().lower()
        canonical_cat = CATEGORY_NORMALIZATION_MAP.get(norm_cat_key)
        if not canonical_cat:
            for c in CANONICAL_CATEGORIES:
                if c.lower() == norm_cat_key:
                    canonical_cat = c
                    break
        target_cat = canonical_cat or (business_category if business_category in CANONICAL_CATEGORIES else CANONICAL_CATEGORIES[0])

        data_resolution = "subdistrict"

        if self.geography_master is not None:
            norm_dist = DISTRICT_ALIASES.get(district_name.upper().strip(), district_name.upper().strip())
            s_mask = (self.geography_master["state_name"].astype(str).str.upper() == state_name.upper())
            d_mask = s_mask & (
                (self.geography_master["district_name"].astype(str).str.upper() == norm_dist) |
                (self.geography_master["district_name"].astype(str).str.upper() == district_name.upper().strip())
            )

            subdist_col = "subdistrict_name" if "subdistrict_name" in self.geography_master.columns else ("name" if "name" in self.geography_master.columns else None)
            
            # 1. Match specific subdistrict inside district
            if subdistrict_name and subdist_col and d_mask.any():
                sub_mask = d_mask & (self.geography_master[subdist_col].astype(str).str.upper() == subdistrict_name.upper().strip())
                if sub_mask.any():
                    location_record = self.geography_master[sub_mask].iloc[0].to_dict()
                    data_resolution = "subdistrict"
                if location_record is not None and "total_population" not in location_record and "population" in location_record:
                    location_record["total_population"] = location_record["population"]

            # 2. Match subdistrict directly across state if district name differed
            if location_record is None and subdistrict_name and subdist_col and s_mask.any():
                sub_state_mask = s_mask & (self.geography_master[subdist_col].astype(str).str.upper() == subdistrict_name.upper().strip())
                if sub_state_mask.any():
                    location_record = self.geography_master[sub_state_mask].iloc[0].to_dict()
                    data_resolution = "subdistrict"

            # 3. District-level aggregate fallback (computed from actual available records)
            if location_record is None and d_mask.any():
                dist_df = self.geography_master[d_mask]
                location_record = dist_df.iloc[0].to_dict()
                numeric_cols = [c for c in self.feature_names if c in dist_df.columns]
                if numeric_cols:
                    location_record.update(dist_df[numeric_cols].mean().to_dict())
                location_record["subdistrict_name"] = subdistrict_name or f"District Average ({district_name})"
                data_resolution = "district"
                warnings.append(f"Sub-district '{subdistrict_name}' not found; using actual district aggregate baseline for {district_name}.")

            # 4. State-level aggregate fallback (computed from actual available records)
            if location_record is None and s_mask.any():
                state_df = self.geography_master[s_mask]
                location_record = state_df.iloc[0].to_dict()
                numeric_cols = [c for c in self.feature_names if c in state_df.columns]
                if numeric_cols:
                    location_record.update(state_df[numeric_cols].mean().to_dict())
                location_record["district_name"] = district_name
                location_record["subdistrict_name"] = subdistrict_name or f"State Average ({state_name})"
                data_resolution = "state"
                warnings.append(f"District '{district_name}' not found; using actual state aggregate baseline for {state_name}.")

        # If location record could not be found anywhere in master data, return transparent INSUFFICIENT_DATA
        if location_record is None:
            return {
                "status": "INSUFFICIENT_DATA",
                "model_version": MODEL_VERSION,
                "methodology_version": METHODOLOGY_VERSION,
                "location": {
                    "state_name": state_name,
                    "district_name": district_name,
                    "subdistrict_name": subdistrict_name or "Unknown"
                },
                "data_resolution": "none",
                "overall_viability_score": None,
                "score_band": "Insufficient Data",
                "confidence": "None",
                "data_completeness": 0.0,
                "ood": True,
                "selected_category": target_cat,
                "selected_category_analysis": None,
                "category_rankings": [],
                "geospatial_radius_available": False,
                "competitor_density_available": False,
                "data_sources": [],
                "warnings": [
                    f"Geographic location '{state_name}, {district_name}' not found in authoritative Census/MSME database. "
                    "Viability calculation cannot be performed without legitimate underlying regional data."
                ],
                "limitations": MODEL_LIMITATIONS
            }

        # OOD & Data Completeness
        is_ood, ood_warnings = self.check_ood(location_record)
        warnings.extend(ood_warnings)
        completeness = self.calculate_data_completeness(location_record)

        # Base Viability Score calculation using trained ML model
        if self.model is not None and self.feature_names and self.scaler is not None:
            try:
                feat_vec = [float(location_record.get(col, 0.0)) for col in self.feature_names]
                feat_scaled = self.scaler.transform([feat_vec])
                raw_pred = float(self.model.predict(feat_scaled)[0])
                viability_score = float(np.clip(raw_pred, 0.0, 100.0))
            except Exception as e:
                logger.warning(f"Model prediction failed, using deterministic baseline: {e}")
                viability_score = self._compute_deterministic_viability(location_record)
        else:
            viability_score = self._compute_deterministic_viability(location_record)

        # Score Band
        score_band = "Moderate Opportunity"
        for low, high, band in SCORE_BANDS:
            if low <= viability_score <= high:
                score_band = band
                break

        # Confidence Rating
        if completeness >= 0.85 and not is_ood and data_resolution == "subdistrict":
            confidence = "High"
        elif completeness >= 0.60 or data_resolution == "district":
            confidence = "Moderate"
        else:
            confidence = "Low"

        # Hyper-local Category Rankings (Evaluates all 15 GramBiz canonical categories)
        category_rankings = rank_business_categories(
            location_features=location_record,
            overall_viability_score=viability_score
        )

        selected_cat_details = None
        for cat_item in category_rankings:
            if cat_item["category"] == target_cat:
                selected_cat_details = cat_item
                break

        return {
            "status": "SUCCESS",
            "model_version": MODEL_VERSION,
            "methodology_version": METHODOLOGY_VERSION,
            "location": {
                "state_name": state_name,
                "district_name": district_name,
                "subdistrict_name": subdistrict_name or location_record.get("subdistrict_name", location_record.get("name", "Unknown"))
            },
            "data_resolution": data_resolution,
            "overall_viability_score": round(viability_score, 2),
            "score_band": score_band,
            "confidence": confidence,
            "data_completeness": completeness,
            "ood": is_ood,
            "selected_category": target_cat,
            "selected_category_analysis": selected_cat_details,
            "category_rankings": category_rankings,
            "geospatial_radius_available": False,
            "competitor_density_available": False,
            "data_sources": data_sources,
            "warnings": warnings,
            "limitations": MODEL_LIMITATIONS
        }

    def _compute_deterministic_viability(self, record: Dict[str, Any]) -> float:
        """Deterministic weighted-index fallback when ML model is unavailable."""
        lit = record.get("literacy_rate", 0.65)
        work = record.get("main_work_rate", 0.35)
        non_agri = record.get("non_agricultural_worker_rate", 0.45)
        msme = min(record.get("msme_density_per_10k_pop", 10.0) / 50.0, 1.0)
        
        score = (lit * 30.0) + (work * 25.0) + (non_agri * 25.0) + (msme * 20.0)
        return float(np.clip(score * 1.1, 10.0, 95.0))
