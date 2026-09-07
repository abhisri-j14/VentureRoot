from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="VentureRoot Census Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "census_data_files"

POPULATION_FILE = DATA_DIR / "state_population.xlsx"
HOUSING_FILE = DATA_DIR / "national_housing.xls"

def load_population_df() -> pd.DataFrame:
    if not POPULATION_FILE.exists():
        raise FileNotFoundError(f"Population dataset missing at {POPULATION_FILE}")
    
    df = pd.read_excel(
        POPULATION_FILE,
        skiprows=7,
        header=None,
        usecols=[7, 8, 9, 10, 11, 12],
        names=["state", "area_type", "households", "total_population", "male_population", "female_population"]
    )
    df = df.dropna(subset=["state"])
    df["state"] = df["state"].astype(str).str.strip()
    return df

def load_housing_df() -> pd.DataFrame:
    if not HOUSING_FILE.exists():
        raise FileNotFoundError(f"Housing dataset missing at {HOUSING_FILE}")
    
    df = pd.read_excel(
        HOUSING_FILE,
        skiprows=7,
        header=None,
        usecols=[5, 6, 7, 8, 9, 10, 12],
        names=["state", "area_type", "total_houses", "vacant_houses", "occupied_houses", "residence", "shop_office"]
    )
    df = df.dropna(subset=["state"])
    df["state"] = df["state"].astype(str).str.replace("STATE - ", "", regex=False).str.strip()
    return df

# Flat routes for broad data queries
@app.get("/api/population")
def get_population(state: Optional[str] = None):
    try:
        df = load_population_df()
        if state:
            df = df[df["state"].str.lower() == state.lower()]
        return {"status": "success", "total_records": len(df), "data": df.fillna("").to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/housing")
def get_housing(state: Optional[str] = None):
    try:
        df = load_housing_df()
        if state:
            df = df[df["state"].str.lower() == state.lower()]
        return {"status": "success", "total_records": len(df), "data": df.fillna("").to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Aggregated endpoint satisfying locationApi.ts
@app.get("/locations/{location_id}/statistics")
def get_location_statistics(location_id: str):
    try:
        pop_df = load_population_df()
        house_df = load_housing_df()

        # Clean locationId (e.g., "punjab" -> "PUNJAB")
        search_target = location_id.strip().lower()

        pop_match = pop_df[(pop_df["state"].str.lower() == search_target) & (pop_df["area_type"].str.lower() == "total")]
        house_match = house_df[(house_df["state"].str.lower() == search_target) & (house_df["area_type"].str.lower() == "total")]

        if pop_match.empty and house_match.empty:
            raise HTTPException(status_code=404, detail=f"No census data found for location: {location_id}")

        pop_row = pop_match.iloc[0] if not pop_match.empty else {}
        house_row = house_match.iloc[0] if not house_match.empty else {}

        # Extract base metrics
        total_pop = int(pop_row.get("total_population", 0))
        total_houses = int(house_row.get("total_houses", 0))
        commercial_units = int(house_row.get("shop_office", 0))
        
        # Synthesize metrics to satisfy the TypeScript frontend contract
        # Using a standard density heuristic (approx 2% of state population for a dense 5km urban radius proxy)
        radius_5km_proxy = int(total_pop * 0.02) if total_pop > 0 else 0
        radius_10km_proxy = int(total_pop * 0.05) if total_pop > 0 else 0

        # Formulate dynamic observations based on real data
        commercial_ratio = (commercial_units / max(total_houses, 1)) * 100
        commercial_insight = f"High commercial presence ({commercial_ratio:.1f}% of structures)" if commercial_ratio > 5 else "Predominantly residential area"

        # Return the exact MarketAnalysis schema expected by TypeScript
        return {
            "reach": {
                "radius5km": radius_5km_proxy,
                "radius10km": radius_10km_proxy
            },
            "demandIndicators": [
                f"{total_pop:,} total addressable market",
                f"{commercial_units:,} established commercial/office spaces"
            ],
            "localObservations": [
                commercial_insight,
                f"Household count: {int(pop_row.get('households', 0)):,}"
            ],
            "customerSegments": [
                "Local Residents",
                "Working Professionals"
            ],
            "marketSizeValue": total_pop,
            "marketTrends": [
                "Urbanization tracking via census metrics",
                "Structural occupancy rate analysis"
            ],
            "evidenceSources": [
                "Census of India 2011 (Demographics)",
                "Census of India 2011 (H-Series Housing & Amenities)"
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))