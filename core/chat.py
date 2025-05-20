import os
import logging
import argparse
import time
from dotenv import load_dotenv
from langchain_community.vectorstores.faiss import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.globals import set_llm_cache
from langchain_community.cache import SQLiteCache

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))


# ─── Logging Setup ──────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger()

# ─── Environment Setup ─────────────────────────────────────────────
load_dotenv()

BASE_DIR = Path(__file__).parent.parent.resolve()
VECTOR_DB_PATH = BASE_DIR / "data" / "vector_db"

def load_qa_system(vector_store_path, openai_api_key=None, model_name="gpt-3.5-turbo"):
    if openai_api_key is None:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("OpenAI API key is required")

    # Initialize OpenAI embedding model
    log.info("Initializing OpenAI embedding model...")
    embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)

    # Load FAISS vector store
    log.info(f"Loading vector store from {vector_store_path}...")
    db = FAISS.load_local(vector_store_path, embeddings, allow_dangerous_deserialization=True)

    set_llm_cache(SQLiteCache(database_path=".langchain.db"))

    # Initialize OpenAI LLM
    log.info(f"Initializing OpenAI Chat Model: {model_name}...")
    llm = ChatOpenAI(
        openai_api_key=openai_api_key,
        model_name=model_name,
        temperature=0.2,
        max_tokens=512
    )

    # Create QA chain
    log.info("Creating QA chain...")
    qa = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=db.as_retriever(search_kwargs={"k": 4})
    )

    return qa

def interactive_qa(qa_chain):
    log.info("Starting interactive QA session. Type 'exit' to quit.\n")
    while True:
        question = input("💬 Ask: ").strip("\r\n")
        if not question:
            continue
        if question.lower() in {"exit", "quit"}:
            print("👋 Exiting.")
            break

        try:
            start_time = time.time()
            result = qa_chain.invoke({"query": question})
            elapsed = time.time() - start_time
            print(f"\n🧠 Answer ({elapsed:.2f}s):\n{result['result']}\n")
        except Exception as e:
            print(f"⚠️ Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Query a vectorized document using OpenAI")
    parser.add_argument("--openai-api-key", help="OpenAI API key")
    parser.add_argument("--model", default="gpt-3.5-turbo", help="OpenAI model to use (e.g., gpt-4)")
    args = parser.parse_args()

    qa_chain = load_qa_system(VECTOR_DB_PATH, args.openai_api_key, args.model)
    interactive_qa(qa_chain)
