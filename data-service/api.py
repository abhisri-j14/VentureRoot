from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

# Allow your Next.js frontend to request data without being blocked by CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/population")
def get_population_data(state: str = None):
    file_path = "census_data_files/2011-IndiaState-0000.xlsx"
    
    df = pd.read_excel(
        file_path, 
        skiprows=7, 
        header=None,
        usecols=[7, 8, 9, 10, 11, 12], 
        names=["state", "area_type", "households", "total_population", "male_population", "female_population"]
    )
    
    df = df.dropna(subset=["state"])
    df = df.fillna("")
    
    if state:
        df = df[df["state"].str.lower() == state.lower()]
    
    data = df.to_dict(orient="records")
    return {"status": "success", "total_records": len(data), "data": data}

@app.get("/api/housing")
def get_housing_data(state: str = None):
    file_path = "census_data_files/DDW-HL0101-0000.xls"
    
    df = pd.read_excel(
        file_path, 
        skiprows=7, 
        header=None,
        usecols=[5, 6, 7, 8, 9, 10, 12], 
        names=[
            "state", 
            "area_type", 
            "total_houses", 
            "vacant_houses", 
            "occupied_houses", 
            "residence", 
            "shop_office"
        ]
    )
    
    df = df.dropna(subset=["state"])
    df = df.fillna("")
    
    # Clean the government formatting so "STATE - PUNJAB" becomes "PUNJAB"
    df["state"] = df["state"].str.replace("STATE - ", "", regex=False).str.strip()
    
    if state:
        df = df[df["state"].str.lower() == state.lower()]
    
    data = df.to_dict(orient="records")
    
    return {"status": "success", "total_records": len(data), "data": data}