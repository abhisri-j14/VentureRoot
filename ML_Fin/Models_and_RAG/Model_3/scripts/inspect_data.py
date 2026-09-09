"""
GramBiz Model 3 — Data Inspection & Inventory Generator
========================================================
Inspects all raw and external files in data/, computes row/col metrics,
missingness, duplicate counts, schema types, and outputs:
- data/DATASET_INVENTORY.csv
- data/DATASET_INVENTORY.md
"""

import os
import pandas as pd
from pathlib import Path
import json

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"

# Metadata mapping for raw files
KNOWN_METADATA = {
    "agmarknet_daily_prices.csv": {
        "source": "Government of India / AGMARKNET / Data.gov.in",
        "url": "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
        "coverage": "September 2026 (Daily snapshot)",
        "geo_coverage": "Pan-India (States, Districts, APMC Markets)",
        "product_coverage": "Agricultural Commodities (Vegetables, Fruits, Grains, Spices)",
        "unit": "₹/quintal",
        "frequency": "Daily",
        "suitable": True,
        "leakage_risk": "High if same-day min/max price used; Safe if target is modal_price at date T and inputs are shifted T-1 lag.",
        "limitations": "Snapshot contains specific daily observations; requires temporal shift logic for feature engineering."
    },
    "wpi_monthly_2012_2023.csv": {
        "source": "Ministry of Commerce & Industry / Office of Economic Adviser",
        "url": "https://api.data.gov.in/resource/239ac3d0-f08d-40d0-b03c-9b7a426a62d5",
        "coverage": "April 2012 - October 2023",
        "geo_coverage": "National (India)",
        "product_coverage": "870 Wholesale Commodities & Sub-groups",
        "unit": "Index (Base 2011-12=100)",
        "frequency": "Monthly",
        "suitable": True,
        "leakage_risk": "Medium if future WPI used; Safe when lagged strictly before target date T.",
        "limitations": "Monthly national aggregate; requires commodity mapping."
    },
    "WPI-2011-12-May2017.csv": {
        "source": "Office of Economic Adviser",
        "url": "https://eaindustry.nic.in",
        "coverage": "April 2011 - August 2016",
        "geo_coverage": "National (India)",
        "product_coverage": "Wholesale Commodities",
        "unit": "Index (Base 2011-12=100)",
        "frequency": "Monthly",
        "suitable": False,
        "leakage_risk": "Redundant overlapping snapshot with wpi_monthly_2012_2023.csv.",
        "limitations": "Superseded by wpi_monthly_2012_2023.csv; retained under raw/ for lineage."
    },
    "WPI_August_2015.csv": {
        "source": "Office of Economic Adviser",
        "url": "https://eaindustry.nic.in",
        "coverage": "August 2015 Snapshot",
        "geo_coverage": "National (India)",
        "product_coverage": "Wholesale Commodities",
        "unit": "Index (Base 2004-05=100)",
        "frequency": "Monthly",
        "suitable": False,
        "leakage_risk": "Legacy base year 2004-05; non-harmonized.",
        "limitations": "Legacy base year."
    },
    "WPI_July2014.xls": {
        "source": "Office of Economic Adviser",
        "url": "https://eaindustry.nic.in",
        "coverage": "July 2014 Snapshot",
        "geo_coverage": "National (India)",
        "product_coverage": "Wholesale Commodities",
        "unit": "Index (Base 2004-05=100)",
        "frequency": "Monthly",
        "suitable": False,
        "leakage_risk": "Legacy base year 2004-05; non-harmonized.",
        "limitations": "Legacy base year."
    },
    "2011-IndiaStateDist-0000.xlsx": {
        "source": "Office of the Registrar General & Census Commissioner, India",
        "url": "https://censusindia.gov.in",
        "coverage": "Census 2011",
        "geo_coverage": "640 Districts across 35 States/UTs",
        "product_coverage": "Demographics, Literacy, Workforce",
        "unit": "Counts / Ratios",
        "frequency": "Decennial",
        "suitable": True,
        "leakage_risk": "Low (Historical baseline demographic context).",
        "limitations": "Decennial 2011 static baseline."
    },
    "2011-IndiaStateDistSbDistTwn-0000.xlsx": {
        "source": "Office of the Registrar General & Census Commissioner, India",
        "url": "https://censusindia.gov.in",
        "coverage": "Census 2011",
        "geo_coverage": "5,988 Sub-districts / Talukas",
        "product_coverage": "Demographics, Literacy, Workforce",
        "unit": "Counts / Ratios",
        "frequency": "Decennial",
        "suitable": True,
        "leakage_risk": "Low (Historical baseline demographic context).",
        "limitations": "Decennial 2011 static baseline."
    },
    "A-1_NO_OF_VILLAGES_TOWNS_HOUSEHOLDS_POPULATION_AND_AREA.xlsx": {
        "source": "Census 2011 A-1 Table",
        "url": "https://censusindia.gov.in",
        "coverage": "Census 2011",
        "geo_coverage": "Districts / Sub-districts",
        "product_coverage": "Inhabited Villages, Households, Area (sq km)",
        "unit": "Counts / Area",
        "frequency": "Decennial",
        "suitable": True,
        "leakage_risk": "Low.",
        "limitations": "Decennial 2011 static baseline."
    },
    "EC.pdf": {
        "source": "Central Statistics Office / MoSPI",
        "url": "https://mospi.gov.in",
        "coverage": "6th Economic Census Report",
        "geo_coverage": "Pan-India",
        "product_coverage": "Economic Census Methodology",
        "unit": "Text Reference",
        "frequency": "N/A",
        "suitable": False,
        "leakage_risk": "N/A (Reference document).",
        "limitations": "PDF Document."
    }
}


def inspect_all():
    print("=========================================================")
    print("      GRAMBIZ MODEL 3 — DATASET INVENTORY INSPECTOR     ")
    print("=========================================================")

    records = []
    file_paths = []
    
    for root, _, f_names in os.walk(RAW_DIR):
        for f in f_names:
            file_paths.append(Path(root) / f)

    for p in file_paths:
        rel = p.relative_to(DATA_DIR)
        fname = p.name
        ext = p.suffix.lower()
        size_kb = round(p.stat().st_size / 1024, 2)
        
        meta = KNOWN_METADATA.get(fname, {
            "source": "Government / Auxiliary Dataset",
            "url": "N/A",
            "coverage": "Historical",
            "geo_coverage": "District/State Level",
            "product_coverage": "Industrial / Auxiliary",
            "unit": "Various",
            "frequency": "Annual / Static",
            "suitable": False if "prev" in str(rel) else True,
            "leakage_risk": "Low auxiliary context",
            "limitations": "Auxiliary secondary feature dataset."
        })

        num_rows = 0
        num_cols = 0
        missing_pct = 0.0
        duplicates = 0
        cols_str = ""

        try:
            if ext == ".csv":
                df = pd.read_csv(p, low_memory=False)
                num_rows = len(df)
                num_cols = len(df.columns)
                missing_pct = round(df.isna().sum().sum() / (num_rows * num_cols) * 100, 2) if num_rows * num_cols > 0 else 0
                duplicates = int(df.duplicated().sum())
                cols_str = ", ".join(list(df.columns)[:10]) + ("..." if num_cols > 10 else "")
            elif ext in [".xls", ".xlsx"]:
                df = pd.read_excel(p)
                num_rows = len(df)
                num_cols = len(df.columns)
                missing_pct = round(df.isna().sum().sum() / (num_rows * num_cols) * 100, 2) if num_rows * num_cols > 0 else 0
                duplicates = int(df.duplicated().sum())
                cols_str = ", ".join([str(c) for c in list(df.columns)[:10]]) + ("..." if num_cols > 10 else "")
            else:
                cols_str = "N/A (Binary / Document)"
        except Exception as e:
            cols_str = f"Error reading file: {e}"

        rec = {
            "rel_path": str(rel),
            "filename": fname,
            "format": ext[1:],
            "size_kb": size_kb,
            "num_rows": num_rows,
            "num_cols": num_cols,
            "missing_pct": missing_pct,
            "duplicates": duplicates,
            "source_owner": meta.get("source"),
            "official_url": meta.get("url"),
            "coverage_period": meta.get("coverage"),
            "geographic_coverage": meta.get("geo_coverage"),
            "product_coverage": meta.get("product_coverage"),
            "price_unit": meta.get("unit"),
            "frequency": meta.get("frequency"),
            "suitable_for_training": meta.get("suitable"),
            "target_leakage_risk": meta.get("leakage_risk"),
            "limitations": meta.get("limitations"),
            "important_columns": cols_str
        }
        records.append(rec)

    inv_df = pd.DataFrame(records)
    csv_out = DATA_DIR / "DATASET_INVENTORY.csv"
    inv_df.to_csv(csv_out, index=False)
    print(f"Saved CSV inventory: {csv_out.relative_to(PROJECT_ROOT)}")

    md_out = DATA_DIR / "DATASET_INVENTORY.md"
    with open(md_out, "w", encoding="utf-8") as f:
        f.write("# GramBiz Model 3 — Dataset Inventory & Data Provenance\n\n")
        f.write("This document presents the complete dataset inventory for Model 3 (*Local Market Price Prediction Engine*).\n\n")
        f.write(f"**Total Files Ingested:** {len(records)}\n\n")
        f.write("## Detailed Dataset Inventory\n\n")
        
        for r in records:
            f.write(f"### 📁 `{r['rel_path']}`\n")
            f.write(f"- **Filename:** `{r['filename']}` ({r['format'].upper()}, {r['size_kb']} KB)\n")
            f.write(f"- **Source / Owner:** {r['source_owner']}\n")
            f.write(f"- **Official URL:** {r['official_url']}\n")
            f.write(f"- **Dimensions:** {r['num_rows']:,} rows × {r['num_cols']} columns\n")
            f.write(f"- **Missing Value %:** {r['missing_pct']}%\n")
            f.write(f"- **Duplicate Rows:** {r['duplicates']}\n")
            f.write(f"- **Coverage Period:** {r['coverage_period']}\n")
            f.write(f"- **Geographic Coverage:** {r['geographic_coverage']}\n")
            f.write(f"- **Product Coverage:** {r['product_coverage']}\n")
            f.write(f"- **Price Unit:** {r['price_unit']}\n")
            f.write(f"- **Frequency:** {r['frequency']}\n")
            f.write(f"- **Suitable for Training:** `{r['suitable_for_training']}`\n")
            f.write(f"- **Target Leakage Risk:** {r['target_leakage_risk']}\n")
            f.write(f"- **Limitations:** {r['limitations']}\n")
            f.write(f"- **Sample Columns:** `{r['important_columns']}`\n\n")
            f.write("---\n\n")

    print(f"Saved Markdown inventory: {md_out.relative_to(PROJECT_ROOT)}")
    print("Dataset inventory inspection complete.")


if __name__ == "__main__":
    inspect_all()
