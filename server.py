import sys
from pathlib import Path


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.transcribe_api import router as transcribe_router
from routes.summarize_api import router as summarize_router
from routes.vectorize_api import router as vectorize_router
from routes.chat_api import router as chat_router


sys.path.append(str(Path(__file__).resolve().parent))

app = FastAPI(title="Knowledge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(transcribe_router, prefix="/transcribe")
app.include_router(summarize_router, prefix="/summarize")
app.include_router(vectorize_router, prefix="/vectorize")
app.include_router(chat_router, prefix="/chat")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
