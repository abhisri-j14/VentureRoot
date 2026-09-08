"""
GramBiz Model 3 — API Fetch & Snapshot Refresh Script
=====================================================
Fetches live data snapshot from Data.gov.in AGMARKNET API or uses existing local raw data.
Generates artifacts/data_provenance.json.
"""

import sys
from pathlib import Path
import hashlib
import json
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.data.data_gov_client import DataGovClient, RESOURCE_ID_AGMARKNET
from src.utils.config import RAW_DIR, CACHED_DIR, ARTIFACTS_DIR
from src.utils.logger import get_logger

logger = get_logger("FetchDataScript")


def run_fetch():
    logger.info("Executing fetch_data script...")
    raw_price_file = RAW_DIR / "prices" / "agmarknet_daily_prices.csv"
    
    # Try fetching live snapshot if API key exists, otherwise fallback to local raw snapshot
    try:
        client = DataGovClient()
        cached_file = client.update_snapshot(limit=10000)
        logger.info(f"Live snapshot fetched to {cached_file}")
    except Exception as e:
        logger.warning(f"Could not fetch live API data ({e}). Utilizing offline local raw dataset snapshot.")
        if not raw_price_file.exists():
            raise FileNotFoundError(f"Neither live API nor local price snapshot found at {raw_price_file}")
        
        # Create cached copy from raw
        df = pd.read_csv(raw_price_file)
        cached_file = CACHED_DIR / "agmarknet_api_snapshot.csv"
        df.to_csv(cached_file, index=False)

        sha256_hash = hashlib.sha256()
        with open(cached_file, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        file_hash = sha256_hash.hexdigest()

        provenance = {
            "retrieval_timestamp": pd.Timestamp.now().isoformat(),
            "resource_id": RESOURCE_ID_AGMARKNET,
            "row_count": len(df),
            "col_count": len(df.columns),
            "sha256": file_hash,
            "schema_columns": list(df.columns),
            "cached_file": str(cached_file.relative_to(PROJECT_ROOT)),
            "source_type": "Offline Raw Snapshot Copy"
        }

        prov_path = ARTIFACTS_DIR / "data_provenance.json"
        with open(prov_path, "w", encoding="utf-8") as pf:
            json.dump(provenance, pf, indent=2)

        logger.info(f"Offline dataset snapshot registered in provenance. Hash: {file_hash[:12]}...")


if __name__ == "__main__":
    run_fetch()
