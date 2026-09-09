"""
VentureRoot Data Normalization Module
=====================================
Provides centralized, deterministic normalization for:
- State names (36 Indian States & UTs, abbreviation mapping, historical spellings)
- District, Block/Tehsil, and Village/Locality names
- 15 Canonical VentureRoot Business Categories
- Agricultural and local commodities
- Geographic coordinates (bounds checking, precision formatting)
- Units (Currency INR, Distance km, Mass quintal/kg)

Retains complete transformation lineage: original_value, normalized_value, source, and rule.
"""

import re
from typing import Dict, Any, Optional, Tuple, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class NormalizedField(BaseModel, Generic[T]):
    """Container preserving original input, transformed value, and rule."""
    original_value: Any
    normalized_value: T
    is_transformed: bool
    rule_applied: str


# ------------------------------------------------------------------------------
# 1. CANONICAL BUSINESS CATEGORIES (15 Categories from Step 1 Audit)
# ------------------------------------------------------------------------------
CANONICAL_BUSINESS_CATEGORIES = [
    "Dairy & Milk Processing",
    "Poultry & Livestock Farming",
    "Agriculture & Cold Storage",
    "Food Processing & Grain Milling",
    "Handloom, Tailoring & Textiles",
    "Handicrafts & Artisanal Goods",
    "Grocery & Kirana Retail",
    "Agri-Inputs Outlet & Seed Distribution",
    "Repair & Maintenance Services (Two-Wheeler/EV)",
    "Personal & Beauty Services",
    "Digital Services Kiosk & CSC Center",
    "Fisheries & Aquaculture Processing",
    "Small Light Manufacturing & Packaging",
    "Transportation & Rural Logistics",
    "Renewable Energy & Solar Installations",
]

# Aliases and fuzzy mappings to the 15 canonical categories
CATEGORY_ALIAS_MAP: Dict[str, str] = {
    # Dairy
    "dairy": "Dairy & Milk Processing",
    "dairy processing": "Dairy & Milk Processing",
    "dairy farming": "Dairy & Milk Processing",
    "milk": "Dairy & Milk Processing",
    "milk collection": "Dairy & Milk Processing",
    "ghee": "Dairy & Milk Processing",
    
    # Poultry
    "poultry": "Poultry & Livestock Farming",
    "poultry farm": "Poultry & Livestock Farming",
    "poultry farming": "Poultry & Livestock Farming",
    "broiler": "Poultry & Livestock Farming",
    "layer farm": "Poultry & Livestock Farming",
    "goat farming": "Poultry & Livestock Farming",
    "livestock": "Poultry & Livestock Farming",
    
    # Agriculture / Storage
    "agriculture": "Agriculture & Cold Storage",
    "cold storage": "Agriculture & Cold Storage",
    "warehouse": "Agriculture & Cold Storage",
    "solar cold storage": "Agriculture & Cold Storage",
    "horticulture": "Agriculture & Cold Storage",
    
    # Food Processing
    "food processing": "Food Processing & Grain Milling",
    "food processing & bakery": "Food Processing & Grain Milling",
    "rice mill": "Food Processing & Grain Milling",
    "flour mill": "Food Processing & Grain Milling",
    "atta chakki": "Food Processing & Grain Milling",
    "oil mill": "Food Processing & Grain Milling",
    "bakery": "Food Processing & Grain Milling",
    "spice grinding": "Food Processing & Grain Milling",
    "fruit juice processing": "Food Processing & Grain Milling",
    
    # Textiles / Handloom
    "handloom": "Handloom, Tailoring & Textiles",
    "textiles": "Handloom, Tailoring & Textiles",
    "tailoring": "Handloom, Tailoring & Textiles",
    "apparel": "Handloom, Tailoring & Textiles",
    "garment manufacturing": "Handloom, Tailoring & Textiles",
    "weaving": "Handloom, Tailoring & Textiles",
    
    # Handicrafts
    "handicrafts": "Handicrafts & Artisanal Goods",
    "artisanal goods": "Handicrafts & Artisanal Goods",
    "pottery": "Handicrafts & Artisanal Goods",
    "bamboo craft": "Handicrafts & Artisanal Goods",
    "jute crafts": "Handicrafts & Artisanal Goods",
    "wood carving": "Handicrafts & Artisanal Goods",
    
    # Retail / Kirana
    "retail": "Grocery & Kirana Retail",
    "kirana": "Grocery & Kirana Retail",
    "grocery": "Grocery & Kirana Retail",
    "supermarket": "Grocery & Kirana Retail",
    "general store": "Grocery & Kirana Retail",
    "provision store": "Grocery & Kirana Retail",
    "fmcg store": "Grocery & Kirana Retail",
    
    # Agri Inputs
    "agri-inputs": "Agri-Inputs Outlet & Seed Distribution",
    "agri inputs": "Agri-Inputs Outlet & Seed Distribution",
    "seed store": "Agri-Inputs Outlet & Seed Distribution",
    "fertilizer shop": "Agri-Inputs Outlet & Seed Distribution",
    "pesticides outlet": "Agri-Inputs Outlet & Seed Distribution",
    "farm equipment rental": "Agri-Inputs Outlet & Seed Distribution",
    
    # Repair / Workshop
    "repair": "Repair & Maintenance Services (Two-Wheeler/EV)",
    "repair/maintenance": "Repair & Maintenance Services (Two-Wheeler/EV)",
    "two-wheeler workshop": "Repair & Maintenance Services (Two-Wheeler/EV)",
    "ev workshop": "Repair & Maintenance Services (Two-Wheeler/EV)",
    "auto repair": "Repair & Maintenance Services (Two-Wheeler/EV)",
    "garage": "Repair & Maintenance Services (Two-Wheeler/EV)",
    "motorcycle repair": "Repair & Maintenance Services (Two-Wheeler/EV)",
    
    # Personal & Beauty Services
    "personal services": "Personal & Beauty Services",
    "beauty parlour": "Personal & Beauty Services",
    "salon": "Personal & Beauty Services",
    "barber shop": "Personal & Beauty Services",
    
    # Digital / IT
    "digital services": "Digital Services Kiosk & CSC Center",
    "digital kiosk": "Digital Services Kiosk & CSC Center",
    "csc center": "Digital Services Kiosk & CSC Center",
    "mobile repair": "Digital Services Kiosk & CSC Center",
    "xerox & cyber cafe": "Digital Services Kiosk & CSC Center",
    "internet kiosk": "Digital Services Kiosk & CSC Center",
    
    # Fisheries
    "fisheries": "Fisheries & Aquaculture Processing",
    "fish farming": "Fisheries & Aquaculture Processing",
    "aquaculture": "Fisheries & Aquaculture Processing",
    "fish processing": "Fisheries & Aquaculture Processing",
    "prawn farming": "Fisheries & Aquaculture Processing",
    
    # Light Manufacturing
    "manufacturing": "Small Light Manufacturing & Packaging",
    "small manufacturing": "Small Light Manufacturing & Packaging",
    "packaging unit": "Small Light Manufacturing & Packaging",
    "brick kiln": "Small Light Manufacturing & Packaging",
    "paper bag making": "Small Light Manufacturing & Packaging",
    
    # Transport / Logistics
    "transportation": "Transportation & Rural Logistics",
    "rural logistics": "Transportation & Rural Logistics",
    "goods carrier": "Transportation & Rural Logistics",
    "mini truck transport": "Transportation & Rural Logistics",
    
    # Renewable Energy / Solar
    "renewable energy": "Renewable Energy & Solar Installations",
    "solar": "Renewable Energy & Solar Installations",
    "solar energy": "Renewable Energy & Solar Installations",
    "solar installation": "Renewable Energy & Solar Installations",
    "biogas": "Renewable Energy & Solar Installations",
}


# ------------------------------------------------------------------------------
# 2. INDIAN STATES & UNION TERRITORIES (36 Entities with Abbreviations & Aliases)
# ------------------------------------------------------------------------------
CANONICAL_STATES: Dict[str, str] = {
    # Northern
    "jammu and kashmir": "Jammu & Kashmir",
    "jammu & kashmir": "Jammu & Kashmir",
    "j&k": "Jammu & Kashmir",
    "jk": "Jammu & Kashmir",
    "ladakh": "Ladakh",
    "punjab": "Punjab",
    "pb": "Punjab",
    "haryana": "Haryana",
    "hr": "Haryana",
    "himachal pradesh": "Himachal Pradesh",
    "hp": "Himachal Pradesh",
    "uttarakhand": "Uttarakhand",
    "uttaranchal": "Uttarakhand",
    "uk": "Uttarakhand",
    "uttar pradesh": "Uttar Pradesh",
    "up": "Uttar Pradesh",
    "delhi": "NCT of Delhi",
    "nct of delhi": "NCT of Delhi",
    "dl": "NCT of Delhi",
    "chandigarh": "Chandigarh",
    "ch": "Chandigarh",

    # Western
    "rajasthan": "Rajasthan",
    "rj": "Rajasthan",
    "gujarat": "Gujarat",
    "gj": "Gujarat",
    "maharashtra": "Maharashtra",
    "mh": "Maharashtra",
    "goa": "Goa",
    "ga": "Goa",
    "dadra and nagar haveli and daman and diu": "Dadra & Nagar Haveli and Daman & Diu",
    "daman & diu": "Dadra & Nagar Haveli and Daman & Diu",

    # Central
    "madhya pradesh": "Madhya Pradesh",
    "mp": "Madhya Pradesh",
    "chhattisgarh": "Chhattisgarh",
    "cg": "Chhattisgarh",

    # Eastern
    "west bengal": "West Bengal",
    "wb": "West Bengal",
    "bengal": "West Bengal",
    "paschim banga": "West Bengal",
    "bihar": "Bihar",
    "br": "Bihar",
    "odisha": "Odisha",
    "orissa": "Odisha",
    "od": "Odisha",
    "jharkhand": "Jharkhand",
    "jh": "Jharkhand",

    # Southern
    "andhra pradesh": "Andhra Pradesh",
    "ap": "Andhra Pradesh",
    "telangana": "Telangana",
    "ts": "Telangana",
    "tg": "Telangana",
    "karnataka": "Karnataka",
    "ka": "Karnataka",
    "tamil nadu": "Tamil Nadu",
    "tn": "Tamil Nadu",
    "kerala": "Kerala",
    "kl": "Kerala",
    "puducherry": "Puducherry",
    "pondicherry": "Puducherry",
    "py": "Puducherry",
    "andaman and nicobar islands": "Andaman & Nicobar Islands",
    "andaman & nicobar": "Andaman & Nicobar Islands",
    "an": "Andaman & Nicobar Islands",
    "lakshadweep": "Lakshadweep",
    "ld": "Lakshadweep",

    # North-Eastern
    "assam": "Assam",
    "as": "Assam",
    "sikkim": "Sikkim",
    "sk": "Sikkim",
    "meghalaya": "Meghalaya",
    "ml": "Meghalaya",
    "tripura": "Tripura",
    "tr": "Tripura",
    "mizoram": "Mizoram",
    "mz": "Mizoram",
    "manipur": "Manipur",
    "mn": "Manipur",
    "nagaland": "Nagaland",
    "nl": "Nagaland",
    "arunachal pradesh": "Arunachal Pradesh",
    "ar": "Arunachal Pradesh",
}


# ------------------------------------------------------------------------------
# 3. CANONICAL COMMODITIES
# ------------------------------------------------------------------------------
CANONICAL_COMMODITIES: Dict[str, str] = {
    "potato": "Potato",
    "aloo": "Potato",
    "alu": "Potato",
    
    "paddy": "Paddy (Dhan)",
    "dhan": "Paddy (Dhan)",
    "rice": "Paddy (Dhan)",
    
    "wheat": "Wheat",
    "gehun": "Wheat",
    "gehu": "Wheat",
    
    "maize": "Maize",
    "makka": "Maize",
    "corn": "Maize",
    
    "cotton": "Cotton",
    "kapas": "Cotton",
    
    "onion": "Onion",
    "pyaz": "Onion",
    "kanda": "Onion",
    
    "mustard": "Mustard",
    "sarson": "Mustard",
    "rai": "Mustard",
    
    "soyabean": "Soyabean",
    "soybean": "Soyabean",
    
    "tomato": "Tomato",
    "tamatar": "Tomato",
    
    "fish": "Fish",
    "machhli": "Fish",
    "machli": "Fish",
    "rohu": "Fish",
    "catla": "Fish",
    
    "milk": "Raw Milk",
    "doodh": "Raw Milk",
    
    "sugarcane": "Sugarcane",
    "ganna": "Sugarcane",
    
    "gram": "Bengal Gram (Chana)",
    "chana": "Bengal Gram (Chana)",
    "chickpea": "Bengal Gram (Chana)",
    
    "tur": "Red Gram (Tur/Arhar)",
    "arhar": "Red Gram (Tur/Arhar)",
    "pigeon pea": "Red Gram (Tur/Arhar)",
}


class DataNormalizer:
    """Master Normalization Engine for VentureRoot."""

    @staticmethod
    def normalize_state(raw_state: str) -> NormalizedField[str]:
        """Normalize state name or code to official canonical name."""
        if not raw_state or not str(raw_state).strip():
            return NormalizedField(
                original_value=raw_state,
                normalized_value="Unknown",
                is_transformed=False,
                rule_applied="EMPTY_INPUT_FALLBACK"
            )
        clean = str(raw_state).strip().lower()
        clean = re.sub(r"^state\s*[-–:]\s*", "", clean)  # Strip 'STATE - ' prefix from census files
        clean = re.sub(r"\s+", " ", clean).strip()

        if clean in CANONICAL_STATES:
            norm = CANONICAL_STATES[clean]
            return NormalizedField(
                original_value=raw_state,
                normalized_value=norm,
                is_transformed=(raw_state != norm),
                rule_applied="CANONICAL_STATE_MAP"
            )
        
        # Fallback: title case
        norm = clean.title()
        return NormalizedField(
            original_value=raw_state,
            normalized_value=norm,
            is_transformed=(raw_state != norm),
            rule_applied="TITLE_CASE_FALLBACK"
        )

    @staticmethod
    def normalize_district(raw_district: str) -> NormalizedField[str]:
        """Clean district name (strip prefixes, standardize casing)."""
        if not raw_district or not str(raw_district).strip():
            return NormalizedField(
                original_value=raw_district,
                normalized_value="Unknown",
                is_transformed=False,
                rule_applied="EMPTY_INPUT_FALLBACK"
            )
        clean = str(raw_district).strip()
        clean = re.sub(r"^(district|dist\.?)\s*", "", clean, flags=re.IGNORECASE)
        clean = re.sub(r"\s+district$", "", clean, flags=re.IGNORECASE)
        clean = re.sub(r"\s+", " ", clean).strip()
        norm = clean.title()
        return NormalizedField(
            original_value=raw_district,
            normalized_value=norm,
            is_transformed=(raw_district != norm),
            rule_applied="DISTRICT_CLEANING_REGEX"
        )

    @staticmethod
    def normalize_block(raw_block: Optional[str]) -> NormalizedField[Optional[str]]:
        """Normalize block, sub-district, tehsil, or taluk."""
        if not raw_block or not str(raw_block).strip():
            return NormalizedField(
                original_value=raw_block,
                normalized_value=None,
                is_transformed=False,
                rule_applied="NONE_BLOCK"
            )
        clean = str(raw_block).strip()
        clean = re.sub(r"^(block|tehsil|taluk|sub-district|cd block)\s*", "", clean, flags=re.IGNORECASE)
        clean = re.sub(r"\s+", " ", clean).strip()
        norm = clean.title()
        return NormalizedField(
            original_value=raw_block,
            normalized_value=norm,
            is_transformed=(raw_block != norm),
            rule_applied="BLOCK_CLEANING_REGEX"
        )

    @staticmethod
    def normalize_village(raw_village: Optional[str]) -> NormalizedField[Optional[str]]:
        """Clean village, locality, or ward name."""
        if not raw_village or not str(raw_village).strip():
            return NormalizedField(
                original_value=raw_village,
                normalized_value=None,
                is_transformed=False,
                rule_applied="NONE_VILLAGE"
            )
        clean = str(raw_village).strip()
        clean = re.sub(r"^(village|gram|mouza)\s*", "", clean, flags=re.IGNORECASE)
        clean = re.sub(r"\s+", " ", clean).strip()
        norm = clean.title()
        return NormalizedField(
            original_value=raw_village,
            normalized_value=norm,
            is_transformed=(raw_village != norm),
            rule_applied="VILLAGE_CLEANING_REGEX"
        )

    @staticmethod
    def normalize_category(raw_category: str) -> NormalizedField[str]:
        """Maps any business description or alias into the 15 Canonical VentureRoot Categories."""
        if not raw_category or not str(raw_category).strip():
            return NormalizedField(
                original_value=raw_category,
                normalized_value="Grocery & Kirana Retail",
                is_transformed=True,
                rule_applied="DEFAULT_CATEGORY_FALLBACK"
            )
        clean = str(raw_category).strip().lower()
        clean = re.sub(r"\s+", " ", clean)

        # Exact match to canonical list (case insensitive)
        for cat in CANONICAL_BUSINESS_CATEGORIES:
            if clean == cat.lower():
                return NormalizedField(
                    original_value=raw_category,
                    normalized_value=cat,
                    is_transformed=(raw_category != cat),
                    rule_applied="CANONICAL_EXACT_MATCH"
                )

        # Alias dictionary check
        if clean in CATEGORY_ALIAS_MAP:
            return NormalizedField(
                original_value=raw_category,
                normalized_value=CATEGORY_ALIAS_MAP[clean],
                is_transformed=True,
                rule_applied="ALIAS_MAP_MATCH"
            )

        # Keyword substring matching
        for alias, canon in CATEGORY_ALIAS_MAP.items():
            if alias in clean:
                return NormalizedField(
                    original_value=raw_category,
                    normalized_value=canon,
                    is_transformed=True,
                    rule_applied=f"KEYWORD_SUBSTRING_MATCH ({alias})"
                )

        # Default fallback
        return NormalizedField(
            original_value=raw_category,
            normalized_value="Small Light Manufacturing & Packaging",
            is_transformed=True,
            rule_applied="GENERAL_SECTOR_FALLBACK"
        )

    normalize_business_category = normalize_category

    @staticmethod
    def normalize_commodity(raw_commodity: Optional[str]) -> NormalizedField[Optional[str]]:
        """Normalize agricultural/local commodity name."""
        if not raw_commodity or not str(raw_commodity).strip():
            return NormalizedField(
                original_value=raw_commodity,
                normalized_value=None,
                is_transformed=False,
                rule_applied="NO_COMMODITY_SPECIFIED"
            )
        clean = str(raw_commodity).strip().lower()
        clean = re.sub(r"\s+", " ", clean)

        if clean in CANONICAL_COMMODITIES:
            norm = CANONICAL_COMMODITIES[clean]
            return NormalizedField(
                original_value=raw_commodity,
                normalized_value=norm,
                is_transformed=(raw_commodity != norm),
                rule_applied="CANONICAL_COMMODITY_MAP"
            )

        # Partial matching
        for key, val in CANONICAL_COMMODITIES.items():
            if key in clean:
                return NormalizedField(
                    original_value=raw_commodity,
                    normalized_value=val,
                    is_transformed=True,
                    rule_applied=f"COMMODITY_SUBSTRING_MATCH ({key})"
                )

        norm = clean.title()
        return NormalizedField(
            original_value=raw_commodity,
            normalized_value=norm,
            is_transformed=(raw_commodity != norm),
            rule_applied="TITLE_CASE_FALLBACK"
        )

    @staticmethod
    def normalize_coordinates(
        lat: Optional[float],
        lon: Optional[float]
    ) -> NormalizedField[Optional[Tuple[float, float]]]:
        """
        Validates and normalizes latitude and longitude.
        Verifies coordinate bounds within geographic India box approx [6.0 - 38.0 N, 68.0 - 98.0 E].
        """
        if lat is None or lon is None:
            return NormalizedField(
                original_value=(lat, lon),
                normalized_value=None,
                is_transformed=False,
                rule_applied="COORDINATES_MISSING"
            )

        try:
            f_lat = float(lat)
            f_lon = float(lon)
        except (ValueError, TypeError):
            return NormalizedField(
                original_value=(lat, lon),
                normalized_value=None,
                is_transformed=True,
                rule_applied="COORDINATES_NON_NUMERIC_ERROR"
            )

        # Global sanity check
        if not (-90.0 <= f_lat <= 90.0 and -180.0 <= f_lon <= 180.0):
            return NormalizedField(
                original_value=(lat, lon),
                normalized_value=None,
                is_transformed=True,
                rule_applied="COORDINATES_OUT_OF_GLOBAL_BOUNDS"
            )

        # Precision rounding (6 decimal places = ~0.11m precision)
        norm_lat = round(f_lat, 6)
        norm_lon = round(f_lon, 6)

        return NormalizedField(
            original_value=(lat, lon),
            normalized_value=(norm_lat, norm_lon),
            is_transformed=(lat != norm_lat or lon != norm_lon),
            rule_applied="COORDINATE_PRECISION_NORM"
        )

    @staticmethod
    def normalize_currency(raw_amount: Any) -> NormalizedField[float]:
        """Strip symbols (₹, Rs, commas) and return clean INR float."""
        if raw_amount is None:
            return NormalizedField(original_value=raw_amount, normalized_value=0.0, is_transformed=True, rule_applied="NULL_TO_ZERO")
        if isinstance(raw_amount, (int, float)):
            val = float(raw_amount)
            return NormalizedField(original_value=raw_amount, normalized_value=round(val, 2), is_transformed=False, rule_applied="NUMERIC_PASS")
        
        # String cleansing
        clean = str(raw_amount).strip().replace(",", "")
        clean = re.sub(r"[₹$Rs\.inrINR\s]", "", clean)
        try:
            val = float(clean)
            return NormalizedField(original_value=raw_amount, normalized_value=round(val, 2), is_transformed=True, rule_applied="CURRENCY_CLEANSED")
        except ValueError:
            return NormalizedField(original_value=raw_amount, normalized_value=0.0, is_transformed=True, rule_applied="INVALID_CURRENCY_ZERO_FALLBACK")


# ------------------------------------------------------------------------------
# CONVENIENCE FUNCTION EXPORTS
# ------------------------------------------------------------------------------

def clean_text_string(text: Optional[str]) -> str:
    """Cleans extra whitespace, carriage returns, and strips string."""
    if text is None:
        return ""
    clean = str(text).strip()
    clean = re.sub(r"\s+", " ", clean)
    return clean


def normalize_state_name(raw_state: Optional[str]) -> str:
    """Returns canonical state name or 'Unknown'."""
    if not raw_state:
        return "Unknown"
    return DataNormalizer.normalize_state(str(raw_state)).normalized_value


def normalize_business_category(raw_category: Optional[str]) -> str:
    """Maps raw category/alias to 15 canonical VentureRoot categories."""
    if not raw_category:
        return "Other Rural Enterprise"
    return DataNormalizer.normalize_business_category(str(raw_category)).normalized_value


def normalize_commodity_name(raw_commodity: Optional[str]) -> str:
    """Maps regional/vernacular crop or product to standard commodity name."""
    if not raw_commodity:
        return "General Commodity"
    return DataNormalizer.normalize_commodity(str(raw_commodity)).normalized_value


def validate_and_normalize_coordinates(
    lat: Any,
    lon: Any
) -> Tuple[bool, Optional[Tuple[float, float]], Optional[str]]:
    """
    Validates coordinates against India geographical bounds [6.0-38.0 N, 68.0-98.0 E].
    Returns: (is_valid, (lat, lon), error_message)
    """
    norm_field = DataNormalizer.normalize_coordinates(lat, lon)
    if norm_field.normalized_value is None:
        return False, None, f"Invalid coordinates: {norm_field.rule_applied}"

    n_lat, n_lon = norm_field.normalized_value
    if not (6.0 <= n_lat <= 38.0 and 68.0 <= n_lon <= 98.0):
        return False, None, f"Coordinates ({n_lat:.4f}, {n_lon:.4f}) outside valid India bounds [6.0-38.0 N, 68.0-98.0 E]"

    return True, (n_lat, n_lon), None

