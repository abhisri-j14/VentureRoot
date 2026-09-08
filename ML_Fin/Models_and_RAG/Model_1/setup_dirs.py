"""Phase 1: Create directory structure and organize raw files."""
import os
import shutil

BASE = r"f:\AI Business Advisor\Models_and_RAG\Model_1"

# ── Create directories ──────────────────────────────────────────────
dirs = [
    "data/raw/census",
    "data/raw/consumption",
    "data/raw/economic_census",
    "data/raw/labour",
    "data/raw/macro",
    "data/processed",
    "data/features",
    "src/data",
    "src/features",
    "src/target",
    "src/models",
    "src/explainability",
    "src/utils",
    "scripts",
    "models",
    "reports/data_audit",
    "reports/model_diagnostics",
    "reports/visualizations",
    "notebooks",
    "api",
    "streamlit_app/pages",
    "streamlit_app/styles",
    "tests",
    "configs",
]

for d in dirs:
    os.makedirs(os.path.join(BASE, d), exist_ok=True)
    print(f"  Created: {d}")

# ── Create __init__.py files ────────────────────────────────────────
init_dirs = [
    "src", "src/data", "src/features", "src/target",
    "src/models", "src/explainability", "src/utils", "tests",
]
for d in init_dirs:
    init_path = os.path.join(BASE, d, "__init__.py")
    if not os.path.exists(init_path):
        with open(init_path, "w") as f:
            f.write("")
    print(f"  __init__.py: {d}")

# ── Move raw files into organized subdirectories ────────────────────
moves = {
    # Census
    "2011-IndiaStateDist-0000.xlsx": "data/raw/census/",
    "2011-IndiaStateDistSbDistTwn-0000.xlsx": "data/raw/census/",
    "A-1_NO_OF_VILLAGES_TOWNS_HOUSEHOLDS_POPULATION_AND_AREA.xlsx": "data/raw/census/",
    # Consumption
    "HCES.xlsx": "data/raw/consumption/",
    "HCES.pdf": "data/raw/consumption/",
    # Economic Census
    "EC.pdf": "data/raw/economic_census/",
    # Labour
    "LFPR_June_2026.xlsx": "data/raw/labour/",
    "WPR_June_2026.xlsx": "data/raw/labour/",
}

# CPI Annexures -> macro
for fname in os.listdir(BASE):
    if fname.startswith("Annexures_") and fname.endswith(".xlsx"):
        moves[fname] = "data/raw/macro/"
    if fname.startswith("Indic") and fname.endswith(".xlsx"):
        moves[fname] = "data/raw/macro/"

for fname, dest in moves.items():
    src = os.path.join(BASE, fname)
    dst = os.path.join(BASE, dest, fname)
    if os.path.exists(src):
        shutil.move(src, dst)
        print(f"  Moved: {fname} -> {dest}")
    elif os.path.exists(dst):
        print(f"  Already at: {dest}{fname}")
    else:
        print(f"  NOT FOUND: {fname}")

# ── Clean up audit scripts from root ────────────────────────────────
for f in ["audit_data.py", "audit_lfpr_wpr.py", "audit_granularity.py"]:
    p = os.path.join(BASE, f)
    if os.path.exists(p):
        os.remove(p)
        print(f"  Removed temp: {f}")

print("\n✅ Phase 1: Directory structure created and files organized.")
