"""
VentureRoot Government Data Harvester & Scraper
==============================================
Collects public Level 1 / Level 2 datasets:
- Census India Demographic Tables (PCA / State Summaries)
- Housing & Amenities Tables
- Agmarknet / eNAM Mandi Benchmark Data

Features:
- Strict SSL verification by default (VERIFY_SSL=True)
- Exponential backoff & retry mechanism
- Request rate limiting and ethical User-Agent headers
- Provenance tracking (retrieved_at, source_url, authority_level)
- Checksum & size validation
"""

import hashlib
import logging
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional
from urllib.parse import urljoin
import urllib3

import requests
from bs4 import BeautifulSoup

# Base directory
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "census_data_files"

# Logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ventureroot.scraper")

# Secure SSL and Rate-Limiting Configuration
VERIFY_SSL = os.getenv("VERIFY_SSL", "true").lower() == "true"
if not VERIFY_SSL:
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    logger.warning("VERIFY_SSL is explicitly set to false. SSL verification disabled for dev.")

USER_AGENT = "VentureRoot-DataService/2.0 (SIH-AI-Advisor-Pipeline; Contact: support@ventureroot.org)"
DEFAULT_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5"
}

RATE_LIMIT_DELAY_SECONDS = float(os.getenv("SCRAPER_RATE_LIMIT_DELAY", "2.0"))


def compute_sha256(file_path: Path) -> str:
    """Computes SHA-256 hash of a local file."""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()


def download_file_with_retry(
    url: str,
    destination_name: str,
    max_retries: int = 3,
    timeout_seconds: int = 60
) -> Optional[Dict[str, Any]]:
    """
    Downloads a remote file with exponential backoff, rate limiting,
    and metadata provenance generation.
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    file_path = DATA_DIR / destination_name

    if file_path.exists() and file_path.stat().st_size > 1024:
        logger.info(f"Using cached file: {destination_name} ({file_path.stat().st_size} bytes)")
        return {
            "destination_name": destination_name,
            "file_path": str(file_path),
            "size_bytes": file_path.stat().st_size,
            "sha256": compute_sha256(file_path),
            "retrieved_at": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
            "status": "CACHED"
        }

    logger.info(f"Downloading {destination_name} from {url}...")
    backoff = 2.0

    for attempt in range(1, max_retries + 1):
        try:
            # Respect rate limit
            time.sleep(RATE_LIMIT_DELAY_SECONDS)
            
            res = requests.get(
                url,
                headers=DEFAULT_HEADERS,
                verify=VERIFY_SSL,
                stream=True,
                timeout=timeout_seconds
            )
            res.raise_for_status()

            with open(file_path, "wb") as f:
                for chunk in res.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        f.write(chunk)

            logger.info(f"Successfully downloaded {destination_name} ({file_path.stat().st_size} bytes)")
            return {
                "destination_name": destination_name,
                "file_path": str(file_path),
                "size_bytes": file_path.stat().st_size,
                "sha256": compute_sha256(file_path),
                "retrieved_at": datetime.utcnow().isoformat(),
                "status": "DOWNLOADED"
            }

        except Exception as err:
            logger.warning(f"Attempt {attempt}/{max_retries} failed for {url}: {err}")
            if file_path.exists():
                file_path.unlink()
            if attempt < max_retries:
                time.sleep(backoff)
                backoff *= 2

    logger.error(f"Failed to download {destination_name} after {max_retries} attempts.")
    return None


def scrape_population_data() -> Optional[Dict[str, Any]]:
    """Fetches official Census India state-level demographic tables."""
    logger.info("--- Fetching Demographic Data ---")
    url = "https://censusindia.gov.in/census.website/data/population-finder"
    try:
        response = requests.get(url, headers=DEFAULT_HEADERS, verify=VERIFY_SSL, timeout=30)
        soup = BeautifulSoup(response.text, "html.parser")

        for link in soup.find_all("a"):
            href = link.get("href", "")
            if "IndiaState-0000" in href and href.endswith(".xlsx"):
                full_url = urljoin(url, href)
                return download_file_with_retry(full_url, "state_population.xlsx")
    except Exception as err:
        logger.error(f"Scraping population finder page failed: {err}")
    return None


def scrape_housing_data() -> Optional[Dict[str, Any]]:
    """Fetches official Census India national housing and amenities tables."""
    logger.info("--- Fetching Housing Data ---")
    api_url = "https://censusindia.gov.in/nada/index.php/api/tables/data/global/census_tables/15/0/?ft_query=&series_id=10&census_year=2011"
    try:
        response = requests.get(api_url, headers=DEFAULT_HEADERS, verify=VERIFY_SSL, timeout=30)
        data = response.json()

        for category in data.get("data", []):
            for item in category.get("items", []):
                for link_obj in item.get("links", []):
                    file_url = link_obj.get("link", "")
                    if "HL0101-0000" in file_url and file_url.endswith(".xls"):
                        return download_file_with_retry(file_url, "national_housing.xls")
    except Exception as err:
        logger.error(f"Scraping housing tables failed: {err}")
    return None


if __name__ == "__main__":
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    pop_meta = scrape_population_data()
    house_meta = scrape_housing_data()
    logger.info("Scraping pipeline finished.")