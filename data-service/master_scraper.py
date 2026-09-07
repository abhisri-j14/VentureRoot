import os
from pathlib import Path
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup
import urllib3

# Base directory anchored to this file's folder
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "census_data_files"

# Configurable SSL check (defaults to True for CI/CD, set VERIFY_SSL=false in dev if needed)
VERIFY_SSL = os.getenv("VERIFY_SSL", "false").lower() == "true"
if not VERIFY_SSL:
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

HEADERS = {"User-Agent": "CensusDataService/1.0 (Data Pipeline)"}

def download_file(url: str, destination_name: str):
    file_path = DATA_DIR / destination_name
    if file_path.exists() and file_path.stat().st_size > 0:
        print(f"Skipping {destination_name} (already downloaded).")
        return
        
    print(f"Downloading {destination_name} from {url}...")
    try:
        res = requests.get(url, headers=HEADERS, verify=VERIFY_SSL, stream=True, timeout=60)
        res.raise_for_status()
        
        with open(file_path, "wb") as f:
            for chunk in res.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)
        print(" -> Success")
    except Exception as error:
        print(f" -> ERROR: {error}")
        if file_path.exists():
            file_path.unlink()

def scrape_population_data():
    print("\n--- Fetching Demographic Data ---")
    url = "https://censusindia.gov.in/census.website/data/population-finder"
    response = requests.get(url, headers=HEADERS, verify=VERIFY_SSL)
    soup = BeautifulSoup(response.text, "html.parser")
    
    for link in soup.find_all("a"):
        href = link.get("href", "")
        # Identify the state-level table and save to a standardized name
        if "IndiaState-0000" in href and href.endswith(".xlsx"):
            full_url = urljoin(url, href)
            download_file(full_url, "state_population.xlsx")
            break

def scrape_housing_data():
    print("\n--- Fetching Housing Data ---")
    api_url = "https://censusindia.gov.in/nada/index.php/api/tables/data/global/census_tables/15/0/?ft_query=&series_id=10&census_year=2011"
    response = requests.get(api_url, headers=HEADERS, verify=VERIFY_SSL)
    data = response.json()
    
    for category in data.get("data", []):
        for item in category.get("items", []):
            for link_obj in item.get("links", []):
                file_url = link_obj.get("link", "")
                if "HL0101-0000" in file_url and file_url.endswith(".xls"):
                    download_file(file_url, "national_housing.xls")
                    return

if __name__ == "__main__":
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    scrape_population_data()
    scrape_housing_data()
    print("\nScraping pipeline completed successfully.")