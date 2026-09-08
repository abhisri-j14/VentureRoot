"""
VentureRoot Data Intelligence Layer Configuration
"""

import os
from pathlib import Path
from pydantic import BaseModel, Field

# Base directories
PACKAGE_DIR = Path(__file__).resolve().parent
SCRAPING_DIR = PACKAGE_DIR.parent
BACKEND_DIR = SCRAPING_DIR.parent
ROOT_DIR = BACKEND_DIR.parent

class DataIntelligenceSettings(BaseModel):
    project_name: str = "VentureRoot"
    env: str = Field(default_factory=lambda: os.getenv("VENTUREROOT_ENV", "development"))
    verify_ssl: bool = Field(default_factory=lambda: os.getenv("VERIFY_SSL", "true").lower() == "true")
    scraper_timeout: int = Field(default_factory=lambda: int(os.getenv("SCRAPER_TIMEOUT_SECONDS", "30")))
    cache_ttl_hours: int = Field(default_factory=lambda: int(os.getenv("CACHE_TTL_HOURS", "24")))
    
    # Paths
    cache_dir: Path = SCRAPING_DIR / "cache"
    census_data_dir: Path = SCRAPING_DIR / "census_data_files"
    data_dir: Path = PACKAGE_DIR / "data"
    
    # User-Agent for ethical public data scraping
    user_agent: str = Field(
        default_factory=lambda: os.getenv(
            "SCRAPER_USER_AGENT",
            "VentureRoot-DataIntelligence/1.0 (Government Public Data Research Pipeline; contact@ventureroot.org)"
        )
    )

    def ensure_directories(self):
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.census_data_dir.mkdir(parents=True, exist_ok=True)
        self.data_dir.mkdir(parents=True, exist_ok=True)

settings = DataIntelligenceSettings()
settings.ensure_directories()
