import json
import logging
import tempfile
import shutil
from pathlib import Path
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from core.document_vectorizer import DocumentVectorizer

router = APIRouter(prefix="/vectorize", tags=["Vectorize"])

@router.post("")
async def vectorize_post(files: List[UploadFile] = File(...)):
    """
    Upload:
      • transcript.json      (required, contains {"text": "...", "segments":[]})
      • optional other docs  (pdf, pptx, png…)
    Builds / updates vector_db/ FAISS index and returns chunk count.
    """

    transcript_file = None
    other_files = []

    for up in files:
        if up.filename.lower().endswith(".json") and transcript_file is None:
            transcript_file = up
        else:
            other_files.append(up)

    if transcript_file is None:
        raise HTTPException(400, detail="Upload must include transcript.json")

    try:
        data = json.loads((await transcript_file.read()).decode())
        transcript_text = data["text"]
    except Exception as exc:
        raise HTTPException(400, detail=f"Invalid transcript.json: {exc}")

    work_dir = Path(tempfile.mkdtemp(prefix="vect_"))

    try:
        (work_dir / "transcript.txt").write_text(transcript_text, encoding="utf-8")

        saved = ["transcript.txt"]
        for up in other_files:
            dest = work_dir / up.filename
            dest.write_bytes(await up.read())
            saved.append(dest.name)

        logging.info("📂 Vectorizing %s (%d docs)", work_dir, len(saved))

        vec = DocumentVectorizer()
        stores = vec.vectorize_by_format(
            input_path=str(work_dir),
            output_dir="data/vector_db",
            combine_all=True,
            batch_size=16,
            chunk_size=1000,
            chunk_overlap=200,
        )

        chunks = sum(s.index.ntotal for s in stores.values()) if stores else 0
        return {
            "vector_store_path": "vector_db",
            "chunks": chunks,
            "saved_files": saved,
        }

    except Exception as exc:
        logging.exception("Vectorization failed")
        raise HTTPException(500, detail=str(exc))

    finally:
        shutil.rmtree(work_dir, ignore_errors=True)

@router.get("/download")
async def vectorize_download():
    index_path = Path("data/vector_db/index.faiss")
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="index.faiss not found in data/vector_db")
    return FileResponse(
        path=index_path,
        media_type="application/octet-stream",
        filename="index.faiss",
    )

@router.get("")
async def vectorize_info():
    index_path = Path("data/vector_db/index.faiss")
    if not index_path.exists():
        return {"status": "not_ready", "message": "Run /vectorize to generate the vector store."}
    return {
        "status": "ready",
        "path": str(index_path),
        "size_kb": index_path.stat().st_size // 1024
    }