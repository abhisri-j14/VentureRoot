import os
import requests
from bs4 import BeautifulSoup
import urllib3
from urllib.parse import urljoin 

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def download_file(url, file_name):
    file_path = os.path.join("census_data_files", file_name)
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        print(f"Skipping {file_name} (already downloaded).")
        return
        
    print(f"Downloading {file_name}...")
    try:
        res = requests.get(url, verify=False, stream=True, timeout=60)
        res.raise_for_status()
        
        with open(file_path, "wb") as file:
            for chunk in res.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    file.write(chunk)
        print(" -> Success")
    except Exception as error:
        print(f" -> ERROR: {error}")
        if os.path.exists(file_path):
            os.remove(file_path)

def get_population_data():
    print("\n--- Fetching Population Data ---")
    url = "https://censusindia.gov.in/census.website/data/population-finder"
    headers = {"User-Agent": "SIHHackathonScraper/1.0"}
    
    response = requests.get(url, headers=headers, verify=False)
    soup = BeautifulSoup(response.text, "html.parser")
    
    for link in soup.find_all("a"):
        href = link.get("href")
        if href and href.endswith(".xlsx"):
            full_url = urljoin(url, href)
            file_name = full_url.split("/")[-1]
            download_file(full_url, file_name)

def get_housing_data():
    print("\n--- Fetching National Housing Data ---")
    api_url = "https://censusindia.gov.in/nada/index.php/api/tables/data/global/census_tables/15/0/?ft_query=&series_id=10&census_year=2011"
    headers = {"User-Agent": "SIHHackathonScraper/1.0"}
    
    response = requests.get(api_url, headers=headers, verify=False)
    data = response.json()
    
    for category in data.get("data", []):
        for item in category.get("items", []):
            links = item.get("links", [])
            if links:
                file_url = links[0].get("link")
                file_name = file_url.split("/")[-1]
                
                # The filter: only download the national aggregate files
                if file_name.endswith("0000.xls"):
                    download_file(file_url, file_name)

if __name__ == "__main__":
    os.makedirs("census_data_files", exist_ok=True)
    get_population_data()
    get_housing_data()
    print("\nAll required hackathon data downloaded successfully!")