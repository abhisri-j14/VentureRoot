"""
Ingestion Validation & Report Generation.
Verifies file format, text readability, deduplication, and writes artifacts/ingestion_report.json.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".docx", ".html", ".htm", ".csv", ".json", ".md"}

class IngestionValidator:
    def __init__(self, min_char_count: int = 50):
        self.min_char_count = min_char_count

    def validate_file(self, file_path: Path) -> Dict[str, Any]:
        """Perform pre-ingestion validation checks on a file."""
        if not file_path.exists():
            return {"valid": False, "reason": "File does not exist"}
            
        ext = file_path.suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            return {"valid": False, "reason": f"Unsupported format '{ext}'. Allowed: {SUPPORTED_EXTENSIONS}"}
            
        if file_path.stat().st_size == 0:
            return {"valid": False, "reason": "Empty file (0 bytes)"}
            
        return {"valid": True, "reason": "Format & existence verified"}

    def validate_extracted_text(self, text: str, page_num: Optional[int] = None) -> Dict[str, Any]:
        """Validate extracted text quality."""
        clean_text = text.strip()
        if len(clean_text) < self.min_char_count:
            return {
                "valid": False,
                "reason": f"Text too short ({len(clean_text)} chars < min {self.min_char_count})",
                "page": page_num
            }
            
        # Check for unreadable/binary garbage
        non_printable = sum(1 for c in clean_text if not c.isprintable() and c not in "\n\r\t")
        if len(clean_text) > 0 and (non_printable / len(clean_text)) > 0.15:
            return {
                "valid": False,
                "reason": "Garbage/binary text detected (>15% non-printable characters)",
                "page": page_num
            }
            
        return {"valid": True, "reason": "Text readable & valid"}

def save_ingestion_report(
    report_data: Dict[str, Any],
    output_path: Optional[Path] = None
) -> Path:
    """Save ingestion report to artifacts/ingestion_report.json."""
    if output_path is None:
        from ..config import settings
        output_path = settings.artifacts_dir / "ingestion_report.json"
        
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_data["generated_at"] = datetime.now(timezone.utc).isoformat()
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
        
    return output_path
