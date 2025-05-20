import asyncio
import logging
from pathlib import Path
from functools import lru_cache

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from core.chat import load_qa_system

router = APIRouter(prefix="/chat", tags=["Chat"])

class QARequest(BaseModel):
    question: str

@lru_cache()
def get_chat_chain():
    index_path = Path("data/vector_db/index.faiss")
    if not index_path.exists():
        raise RuntimeError("❌ Vector store not found. Run /vectorize first.")
    return load_qa_system("data/vector_db")

@router.post("")
async def chat_endpoint(request: QARequest):
    """Synchronous Q&A endpoint."""
    try:
        chat_chain = get_chat_chain()
        result = chat_chain.invoke({"query": request.question})
        return {"answer": result["result"]}
    except Exception as exc:
        logging.exception("Chat failed")
        raise HTTPException(500, detail=str(exc))

@router.post("/stream")
async def stream_chat(request: QARequest):
    """Streaming Q&A endpoint (word-by-word)."""
    try:
        chat_chain = get_chat_chain()

        async def token_stream():
            result = chat_chain.invoke({"query": request.question})
            for word in result["result"].split():
                yield word + " "
                await asyncio.sleep(0)

        return StreamingResponse(token_stream(), media_type="text/plain")

    except Exception as exc:
        logging.exception("Streaming chat failed")
        raise HTTPException(500, detail=str(exc))