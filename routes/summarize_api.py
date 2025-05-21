from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from pathlib import Path
import json
import logging

from core.summarizer import summarize_text

router = APIRouter(prefix="/summarize", tags=["Summarize"])

# Resolve the base /data directory from project root
DATA_DIR = Path(__file__).parent.parent / "data"
SUMMARY_PATH = DATA_DIR / "summary.json"

@router.post("")
async def summarize_from_file(
    file: UploadFile = File(..., description="Upload a transcript file (.txt or .json)")
):
    """Accept a file, summarize it, and return the result."""
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)

        contents = await file.read()

        # Try to decode the file content
        try:
            content_str = contents.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Unable to decode file. Please upload a UTF-8 text or JSON file.")

        # Attempt to parse JSON (if possible)
        try:
            parsed = json.loads(content_str)
            text = parsed.get("text", "")
        except json.JSONDecodeError:
            # If not JSON, treat as raw text
            text = content_str

        if not text.strip():
            raise HTTPException(status_code=400, detail="No text content found to summarize.")

        summary = summarize_text(text)

        with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
            json.dump({"summary": summary}, f, ensure_ascii=False, indent=2)

        return {
            "message": f"Summary saved to {SUMMARY_PATH.name}",
            "summary_path": str(SUMMARY_PATH),
            "summary": summary
        }

    except Exception as exc:
        logging.exception("Summarization failed")
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("")
async def summarize_get():
    """Return the summary stored in summary.json in /data."""
    if not SUMMARY_PATH.exists():
        raise HTTPException(status_code=404, detail="summary.json not found")
    return FileResponse(
        path=SUMMARY_PATH,
        media_type="application/json",
        filename="summary.json",
    )