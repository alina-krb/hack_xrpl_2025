from fastapi import APIRouter, HTTPException, UploadFile, File
from pathlib import Path
import json
import logging
from core.video2text import transcribe_video

router = APIRouter(prefix="/transcribe", tags=["Transcription"])

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

@router.post("/transcribe-file")
async def transcribe_uploaded_video(
    file: UploadFile = File(..., description="Upload a video file (e.g., .mp4)")
):
    try:
        # Save the uploaded file temporarily inside /data
        video_path = DATA_DIR / file.filename
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(video_path, "wb") as f:
            f.write(await file.read())

        # Transcribe the video
        text, segments = transcribe_video(str(video_path))
        payload = {"text": text, "segments": segments}

        # Save transcript to transcript.json in /data
        transcript_path = DATA_DIR / "transcript.json"
        with open(transcript_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)

        return {
            "message": f"Transcript saved to {transcript_path.name}",
            "transcript_path": str(transcript_path),
            "video_path": str(video_path),
            "transcript": payload
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