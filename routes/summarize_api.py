from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
import json
import logging

from core.summarizer import summarize_text

router = APIRouter(prefix="/summarize", tags=["Summarize"])

# Resolve the base /data directory from project root
DATA_DIR = Path(__file__).parent.parent / "data"
SUMMARY_PATH = DATA_DIR / "summary.json"

class Transcript(BaseModel):
    text: str
    segments: list[dict] | None = None

@router.post("")
async def summarize_post(payload: Transcript):
    """Accept transcript JSON and save a summary to summary.json in /data."""
    if not payload.text:
        raise HTTPException(status_code=400, detail="Field 'text' empty or missing")

    try:
        summary = summarize_text(payload.text)
        DATA_DIR.mkdir(parents=True, exist_ok=True)  # Ensure folder exists
        with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
            json.dump({"summary": summary}, f, ensure_ascii=False, indent=2)
        return {"message": f"Summary saved to {SUMMARY_PATH}"}
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