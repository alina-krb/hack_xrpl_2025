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

from fastapi import Form, File, UploadFile
from typing import List
import tempfile, shutil, json
from document_vectorizer import DocumentVectorizer 


import os, json, tempfile, shutil, logging, asyncio
from pathlib import Path
from typing import List

from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

from video2text import transcribe_video
from summarizer import summarize_text
from document_vectorizer import DocumentVectorizer

from langchain_community.vectorstores.faiss import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.chains import RetrievalQA

from qa_system import load_qa_system

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="Knowledge API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)



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
class QARequest(BaseModel):
        question: str

vectorizer = DocumentVectorizer()


# TRANSCRIBE
# POST : Receive video and return transcript.json in the same folder 
# GET :  Return transcript.json
@app.post("/transcribe")
async def transcribe_post(
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

        # Save transcript to transcript.json
        with open("transcript.json", "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        return {"message": "Transcript saved to transcript.json"}

    except Exception as exc:
        logging.exception("Transcription failed")
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        tmp_path.unlink(missing_ok=True)

@app.get("/transcribe")
async def transcribe_get():
    transcript_path = Path("transcript.json")
    if not transcript_path.exists():
        raise HTTPException(status_code=404, detail="transcript.json not found")
    return FileResponse(
        path=transcript_path,
        media_type="application/json",
        filename="transcript.json",
    )

#SUMMARIZE
# POST : Receive transcript.json and return a summary.
# GET : Receive name of video and return a summary.
@app.post("/summarize")
async def summarize_post(payload: Transcript):
    """Accept transcript JSON (same structure from /transcribe) and save a summary to summary.json."""
    if not payload.text:
        raise HTTPException(400, "Field 'text' empty or missing")

    try:
        summary = summarize_text(payload.text)
        # Save summary to summary.json
        with open("summary.json", "w", encoding="utf-8") as f:
            json.dump({"summary": summary}, f, ensure_ascii=False, indent=2)
        return {"message": "Summary saved to summary.json"}
    except Exception as exc:
        logging.exception("Summarization failed")
        raise HTTPException(status_code=500, detail=str(exc))

# return the summary of the video
@app.get("/summarize")
async def summarize_get():
    summary_path = Path("summary.json")
    if not summary_path.exists():
        raise HTTPException(status_code=404, detail="summary.json not found")
    return FileResponse(
        path=summary_path,
        media_type="application/json",
        filename="summary.json",
    )

# VECTORIZE
# POST : Receive transcript.json and other files and return a vectorized files database.
# GET : Receive name of video and return a vectorized files database.   
@app.post("/vectorize")
async def vectorize_post(files: List[UploadFile] = File(...)):
    """
    Upload:
      • transcript.json      (required, contains {"text": "...", "segments":[]})
      • optional other docs  (pdf, pptx, png…)
    Builds / updates vector_db/ FAISS index and returns chunk count.
    """

    # ---- separate transcript.json from the rest ----
    transcript_file = None
    other_files = []
    for up in files:
        if up.filename.lower().endswith(".json") and transcript_file is None:
            transcript_file = up
        else:
            other_files.append(up)

    if transcript_file is None:
        raise HTTPException(400, "Upload must include transcript.json")

    # ---- read transcript JSON ----
    try:
        data = json.loads((await transcript_file.read()).decode())
        transcript_text = data["text"]
    except Exception as exc:
        raise HTTPException(400, f"Invalid transcript.json: {exc}")

    # ---- create a temp workspace ----
    work_dir = Path(tempfile.mkdtemp(prefix="vect_"))

    try:
        # save transcript as plain text
        (work_dir / "transcript.txt").write_text(transcript_text, encoding="utf-8")

        # save extra files
        saved = ["transcript.txt"]
        for up in other_files:
            dest = work_dir / up.filename
            dest.write_bytes(await up.read())
            saved.append(dest.name)

        logging.info("📂 Vectorizing %s (%d docs)", work_dir, len(saved))

        # ---- run vectorizer ----
        vec = DocumentVectorizer()
        stores = vec.vectorize_by_format(
            input_path=str(work_dir),
            output_dir="vector_db",
            combine_all=True,          # single FAISS index
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

# return the vectorized files database
@app.get("/vectorize")
async def vectorize_get():
    index_path = Path("vector_db/index.faiss")
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="index.faiss not found in vector_db")
    return FileResponse(
        path=index_path,
        media_type="application/octet-stream",
        filename="index.faiss",
    )

def _get_qa_chain(idx_path: str, model_name="gpt-3.5-turbo") -> RetrievalQA:
    global _qa_chain
    if _qa_chain is None:
        # lazy‑load index & language model once
        if not Path(idx_path, "index.faiss").exists():
            raise FileNotFoundError(f"Vector store not found: {idx_path}")
        embeddings = OpenAIEmbeddings()
        db = FAISS.load_local(idx_path, embeddings, allow_dangerous_deserialization=True)
        llm = ChatOpenAI(model_name=model_name, temperature=0.2, max_tokens=512)
        _qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=db.as_retriever(search_kwargs={"k": 4}))
    return _qa_chain


qa_chain: RetrievalQA | None = None          # cache

@app.post("/qa", response_model=dict)
async def qa(request: QARequest,
             stream: bool = False,
             model: str = "gpt-3.5-turbo"):
    """
    Ask questions against the FAISS index in ./vector_db.
    ?stream=true  → stream plain-text tokens instead of JSON.
    """

    global qa_chain
    if qa_chain is None:
        index_path = "vector_db"
        if not Path(index_path, "index.faiss").exists():
            raise HTTPException(404, "Run /vectorize first; index not found.")
        qa_chain = load_qa_system(index_path, model_name=model)

    def _answer() -> str:
        return qa_chain.invoke({"query": request.question})["result"]

    if not stream:
        ans = await asyncio.to_thread(_answer)
        return {"answer": ans}

    async def token_stream():
        ans = await asyncio.to_thread(_answer)
        for tok in ans.split():
            yield tok + " "
            await asyncio.sleep(0)
    return StreamingResponse(token_stream(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)