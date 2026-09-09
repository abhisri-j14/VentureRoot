# SIH Census Data API

This is the Python/FastAPI backend microservice for our SIH dashboard. It automates the extraction of the 2011 Indian Census demographic and H-Series housing datasets, processes the raw Excel files using Pandas, and serves them as fast, filterable JSON endpoints. 

Crucially, it includes an aggregated endpoint that directly satisfies the frontend `MarketAnalysis` TypeScript contract.

## 🚀 Quick Start

Because the raw Excel files are extremely large, they are excluded from Git via `.gitignore`. You must run the scraper script once on your local machine to generate the data folder before booting the server.

### 1. Setup the Environment
Open your terminal in the backend directory and create a virtual environment:

    # Windows
    python -m venv venv
    source venv/Scripts/activate

    # Mac/Linux
    python3 -m venv venv
    source venv/bin/activate

Install the required dependencies:

    pip install -r requirements.txt

### 2. Download the Census Data
Run the master scraping pipeline. This will safely download and standardize the required datasets (`state_population.xlsx` and `national_housing.xls`) into a local `census_data_files` directory.

    python master_scraper.py

### 3. Start the Development Server
Boot up the FastAPI server:

    uvicorn api:app --reload

To expose the API to other laptops on the same Wi-Fi network (for cross-device frontend testing), run:

    uvicorn api:app --host 0.0.0.0 --port 8000 --reload

You can view the interactive API documentation at: `http://localhost:8000/docs`

---

## 📡 API Endpoints

The API is fully open (CORS enabled for `*`) so the Next.js client can fetch directly without browser security blocks.

### 1. Location Statistics (Frontend Integration Route)
`GET /locations/{location_id}/statistics`

This is the primary endpoint expected by `locationApi.ts`. It synthesizes population and housing data into the required `MarketAnalysis` schema.

**Path Parameters:**
* `location_id` (string) - The state name (case-insensitive).
  * Example: `http://localhost:8000/locations/punjab/statistics`

**Response Structure:**

    {
      "reach": {
        "radius5km": 554866,
        "radius10km": 1387166
      },
      "demandIndicators": [
        "27743338 total addressable market",
        "252033 established commercial/office spaces"
      ],
      "localObservations": [
        "Predominantly residential area",
        "Household count: 5513063"
      ],
      "customerSegments": [
        "Local Residents",
        "Working Professionals"
      ],
      "marketSizeValue": 27743338,
      "marketTrends": [
        "Urbanization tracking via census metrics",
        "Structural occupancy rate analysis"
      ],
      "evidenceSources": [
        "Census of India 2011 (Demographics)",
        "Census of India 2011 (H-Series Housing & Amenities)"
      ]
    }

### 2. Raw Population Demographics
`GET /api/population`

**Optional Query Parameters:**
* `state` (string) - Filters the data by state name (case-insensitive).
  * Example: `http://localhost:8000/api/population?state=Bihar`

**Response Structure:**

    {
      "status": "success",
      "total_records": 1,
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

### 3. Raw Housing & Amenities (H-Series)
`GET /api/housing`

**Optional Query Parameters:**
* `state` (string) - Filters the data by state name (case-insensitive).
  * Example: `http://localhost:8000/api/housing?state=Punjab`

**Response Structure:**

    {
      "status": "success",
      "total_records": 1,
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