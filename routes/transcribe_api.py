from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pathlib import Path
import json
import logging
from core.video2text import transcribe_video

router = APIRouter(prefix="/transcribe", tags=["Transcription"])

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

@router.post("")
async def transcribe_existing_video(
    filename: str = Query(..., description="Video filename inside 'data/' folder (e.g., 'my_video.mp4')")
):
    try:
        video_path = DATA_DIR / filename

        if not video_path.exists():
            raise HTTPException(status_code=404, detail=f"Video file not found: {video_path}")

        text, segments = transcribe_video(str(video_path))
        payload = {"text": text, "segments": segments}

        transcript_path = video_path.parent / "transcript.json"
        with open(transcript_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)

        return {
            "message": f"Transcript saved to {transcript_path.name}",
            "transcript_path": str(transcript_path),
            "video_path": str(video_path)
        }

    except Exception as exc:
        logging.exception("Transcription failed")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/download")
async def transcribe_get():
    transcript_path = DATA_DIR / "transcript.json"
    if not transcript_path.exists():
        raise HTTPException(status_code=404, detail="transcript.json not found")
    return FileResponse(
        path=transcript_path,
        media_type="application/json",
        filename="transcript.json",
    )