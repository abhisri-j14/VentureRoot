# SIH Census Data API

This is the Python/FastAPI backend microservice for our SIH dashboard. It automates the extraction of the 2011 Indian Census demographic and H-Series housing datasets, processes the raw Excel files using Pandas, and serves them as fast, filterable JSON endpoints for the Next.js frontend.

## 🚀 Quick Start

Because the raw Excel files are extremely large, they are excluded from Git via `.gitignore`. You must run the scraper script once on your local machine to generate the data folder before booting the server.

### 1. Setup the Environment
Open your terminal in the backend directory and create a virtual environment:
` ` `bash
# Windows
python -m venv venv
source venv/Scripts/activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
` ` `

Install the required dependencies:
` ` `bash
pip install -r requirements.txt
` ` `

### 2. Download the Census Data
Run the master scraping pipeline. This will hit the government APIs, bypass the JS-rendered portals, and safely download the required `.xlsx` and `.xls` files into a local `census_data_files` directory.
` ` `bash
python master_scraper.py
` ` `
*(Note: This handles network drops automatically. Let it run until it says "All required hackathon data downloaded successfully!")*

### 3. Start the Development Server
Boot up the FastAPI server:
` ` `bash
uvicorn api:app --reload
` ` `
To expose the API to other laptops on the same Wi-Fi network (for cross-device frontend testing), run:
` ` `bash
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
` ` `

---

## 📡 API Endpoints

The API is fully open (CORS enabled for `*`) so the Next.js client can fetch directly without browser security blocks.

### Population Demographics
`GET /api/population`

**Optional Query Parameters:**
* `state` (string) - Filters the data by state name (case-insensitive).
  * Example: `http://localhost:8000/api/population?state=Bihar`

**Response Structure:**
` ` `json
{
  "status": "success",
  "total_records": 3,
  "data": [
    {
      "state": "BIHAR",
      "area_type": "Total",
      "households": 18913565,
      "total_population": 104099452,
      "male_population": 54278157,
      "female_population": 49821295
    }
  ]
}
` ` `

### Housing & Amenities (H-Series)
`GET /api/housing`

**Optional Query Parameters:**
* `state` (string) - Filters the data by state name (case-insensitive).
  * Example: `http://localhost:8000/api/housing?state=Punjab`

**Response Structure:**
` ` `json
{
  "status": "success",
  "total_records": 3,
  "data": [
    {
      "state": "PUNJAB",
      "area_type": "Total",
      "total_houses": 6929944,
      "vacant_houses": 673998,
      "occupied_houses": 6255946,
      "residence": 5110190,
      "shop_office": 252033
    }
  ]
}
` ` `