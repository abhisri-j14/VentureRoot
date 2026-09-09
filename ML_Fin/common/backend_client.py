"""
VentureRoot ML Common -- Backend API & File Client Helper
========================================================
Enables ML microservices (Model 1, Model 2, AI Advisor, Finance) to retrieve
business context by querying:
1. The live Next.js backend API at /api/v1/businesses/{id}
2. The authoritative backend business folder files (e.g. src/data/businesses.json)

Extracts standardized location hierarchy, category, capital, margin, and revenue.
"""

import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional
import httpx

logger = logging.getLogger("BackendClient")

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:3000")
API_PREFIX = os.getenv("API_PREFIX", "/api/v1")

# Locate project workspace root
_current_dir = Path(__file__).resolve().parent
PROJECT_ROOT = _current_dir.parent.parent
SRC_DATA_DIR = PROJECT_ROOT / "src" / "data"
BUSINESSES_JSON_PATH = SRC_DATA_DIR / "businesses.json"


def _read_from_backend_files(business_id: str) -> Optional[Dict[str, Any]]:
    """
    Fallback: read business record directly from backend business folder files (src/data/businesses.json).
    """
    if not BUSINESSES_JSON_PATH.exists():
        return None

    try:
        with open(BUSINESSES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        details = data.get("details", {})
        if str(details.get("id")) == str(business_id) or str(business_id).lower() in ("123", "default", "current"):
            loc = details.get("location") or {}
            cap = details.get("capital") or {}
            ops = details.get("operations") or {}
            res = details.get("resources") or {}

            category_name = details.get("subcategory") or details.get("category") or "Dairy"
            if "dairy" in category_name.lower():
                normalized_cat = "Dairy"
            elif "retail" in category_name.lower():
                normalized_cat = "Retail"
            else:
                normalized_cat = category_name

            return {
                "business_id": str(details.get("id", business_id)),
                "name": details.get("name", "Green Valley Dairy"),
                "description": details.get("description", ""),
                "category_name": normalized_cat,
                "category_slug": normalized_cat.lower(),
                "state": loc.get("state", "Maharashtra"),
                "district": loc.get("district", "Pune"),
                "subdistrict": loc.get("block", "Khed"),
                "village": loc.get("village") or None,
                "latitude": loc.get("latitude"),
                "longitude": loc.get("longitude"),
                "available_margin": float(cap.get("availableMargin") or 150000.0),
                "expected_revenue": float(ops.get("expectedRevenue") or 45000.0),
                "status": details.get("status", "READY"),
                "source": "backend_file:src/data/businesses.json",
            }

        # Check comparison list
        for item in data.get("comparison", []):
            if str(item.get("id")) == str(business_id):
                item_name = item.get("name", "Retail")
                return {
                    "business_id": str(item.get("id")),
                    "name": item_name,
                    "description": f"{item_name} enterprise comparison model",
                    "category_name": item_name,
                    "category_slug": item_name.lower(),
                    "state": "Maharashtra",
                    "district": "Pune",
                    "subdistrict": "Khed",
                    "village": None,
                    "latitude": None,
                    "longitude": None,
                    "available_margin": 100000.0,
                    "expected_revenue": 50000.0,
                    "status": "READY",
                    "source": "backend_file:src/data/businesses.json",
                }

    except Exception as e:
        logger.warning(f"Failed reading backend business JSON file: {e}")

    return None


def fetch_business_by_id(business_id: str, timeout_sec: float = 3.0) -> Optional[Dict[str, Any]]:
    """
    Query the Next.js backend API at /api/v1/businesses/{business_id} to retrieve
    the authoritative business record. If unreachable, falls back to the backend
    business data files in src/data/businesses.json.

    Parameters
    ----------
    business_id : str
        UUID or ID of the business.
    timeout_sec : float
        HTTP request timeout in seconds.

    Returns
    -------
    dict or None
        Normalized business context dictionary.
    """
    if not business_id:
        return None

    # 1. Try live backend API (try localhost then 127.0.0.1)
    urls = [
        f"{BACKEND_BASE_URL.rstrip('/')}{API_PREFIX}/businesses/{business_id}",
        f"http://127.0.0.1:3000{API_PREFIX}/businesses/{business_id}",
    ]

    for url in urls:
        try:
            with httpx.Client(timeout=timeout_sec) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    payload = resp.json()
                    raw_biz = payload.get("data", {}).get("business", {}) or payload.get("data", {})
                    if raw_biz and isinstance(raw_biz, dict):
                        cat = raw_biz.get("category") or {}
                        loc = raw_biz.get("location") or {}

                        return {
                            "business_id": str(raw_biz.get("id", business_id)),
                            "name": raw_biz.get("name", ""),
                            "description": raw_biz.get("description", ""),
                            "category_name": cat.get("name", "Retail"),
                            "category_slug": cat.get("slug", "retail"),
                            "state": loc.get("state", "Gujarat"),
                            "district": loc.get("district", "Anand"),
                            "subdistrict": loc.get("block") or loc.get("subdistrict") or loc.get("district", "Anand"),
                            "village": loc.get("village") or None,
                            "latitude": loc.get("latitude"),
                            "longitude": loc.get("longitude"),
                            "available_margin": float(raw_biz.get("availableMargin") or 0.0),
                            "expected_revenue": float(raw_biz.get("expectedRevenue") or 0.0),
                            "status": raw_biz.get("status", "DRAFT"),
                            "source": "backend_api",
                        }
        except Exception:
            pass

    # 2. Fallback to backend business folder files
    return _read_from_backend_files(business_id)
