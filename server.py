import logging
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import FileResponse, JSONResponse
import json, tempfile

from video2text import transcribe_video

from summarizer import summarize_text
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="Simple Video Transcriber")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transcript(BaseModel):
    text: str
    segments: list[dict] | None = None

@app.post("/transcribe")
async def transcribe(
    download: bool = False,                       # <-- NEW QS flag
    file: UploadFile = File(...)
):
    suffix = Path(file.filename).suffix or ".mp4"
    with NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)

    try:
        text, segments = transcribe_video(str(tmp_path))
        payload = {"text": text, "segments": segments}

        if not download:
            # normal JSON response (unchanged)
            return JSONResponse(payload)

        # ----- build a temp .json file and send it back -----
        with tempfile.NamedTemporaryFile(
            suffix=".json", delete=False, prefix="transcript_"
        ) as jf:
            json.dump(payload, jf, ensure_ascii=False, indent=2)
            json_path = Path(jf.name)

        return FileResponse(
            path=json_path,
            media_type="application/json",
            filename="transcript.json",
        )

    except Exception as exc:
        logging.exception("Transcription failed")
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        tmp_path.unlink(missing_ok=True)

@app.post("/summarize")
async def summarize(payload: Transcript):
    """Accept transcript JSON (same structure from /transcribe) and return a summary."""
    if not payload.text:
        raise HTTPException(400, "Field 'text' empty or missing")

    try:
        summary = summarize_text(payload.text)
        return {"summary": summary}
    except Exception as exc:
        logging.exception("Summarization failed")
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)