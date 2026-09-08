"""
GramBiz Model 3 — Secure Data.gov.in API Ingestion Client
===========================================================
Ingests agricultural market price datasets from Data.gov.in (AGMARKNET API).
Features:
- Secure key reading from environment (never hard-coded, never printed).
- Exponential backoff and retry handling.
- Local snapshot caching under data/cached/.
- Provenance recording to artifacts/data_provenance.json.
"""

import os
import json
import time
import hashlib
import requests
from typing import Dict, Any, Optional
from pathlib import Path
import pandas as pd

from src.utils.config import DATA_GOV_API_KEY, CACHED_DIR, ARTIFACTS_DIR
from src.utils.logger import get_logger

logger = get_logger("DataGovClient")

RESOURCE_ID_AGMARKNET = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID_AGMARKNET}"


class DataGovClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or DATA_GOV_API_KEY
        if not self.api_key:
            logger.warning("DATA_GOV_API_KEY is missing or empty. Live API calls will fail.")

    def fetch_records(self, limit: int = 1000, offset: int = 0, max_retries: int = 3) -> Dict[str, Any]:
        """Fetches records from Data.gov.in API with retry logic."""
        if not self.api_key:
            raise ValueError("DATA_GOV_API_KEY not configured in environment.")

        params = {
            "api-key": self.api_key,
            "format": "json",
            "limit": limit,
            "offset": offset,
        }

        for attempt in range(1, max_retries + 1):
            try:
                logger.info(f"Requesting Data.gov.in API (offset={offset}, limit={limit}, attempt={attempt})...")
                response = requests.get(BASE_URL, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                if "records" not in data:
                    raise ValueError("API response missing 'records' field.")
                return data
            except (requests.RequestException, ValueError) as e:
                logger.warning(f"API Request attempt {attempt} failed: {e}")
                if attempt == max_retries:
                    raise e
                time.sleep(2 ** attempt)

        raise RuntimeError("Failed to fetch data from API after retries.")

    def update_snapshot(self, limit: int = 5000) -> Path:
        """Fetches live records and updates local snapshot in data/cached/."""
        api_data = self.fetch_records(limit=limit)
        records = api_data.get("records", [])
        
        df = pd.DataFrame(records)
        cached_file = CACHED_DIR / "agmarknet_api_snapshot.csv"
        df.to_csv(cached_file, index=False)

        # Compute SHA256 Hash
        sha256_hash = hashlib.sha256()
        with open(cached_file, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        file_hash = sha256_hash.hexdigest()

        # Update provenance
        provenance = {
            "retrieval_timestamp": pd.Timestamp.now().isoformat(),
            "resource_id": RESOURCE_ID_AGMARKNET,
            "row_count": len(df),
            "col_count": len(df.columns),
            "sha256": file_hash,
            "schema_columns": list(df.columns),
            "cached_file": str(cached_file.relative_to(CACHED_DIR.parent.parent)),
        }

        prov_path = ARTIFACTS_DIR / "data_provenance.json"
        with open(prov_path, "w", encoding="utf-8") as pf:
            json.dump(provenance, pf, indent=2)

        logger.info(f"Snapshot cached successfully ({len(df)} rows). SHA256: {file_hash[:12]}...")
        return cached_file


if __name__ == "__main__":
    client = DataGovClient()
    logger.info("DataGovClient initialized safely.")
