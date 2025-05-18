import os, logging, time
from dotenv import load_dotenv
from langchain_community.vectorstores.faiss import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.globals import set_llm_cache
from langchain_community.cache import SQLiteCache

load_dotenv()
log = logging.getLogger(__name__)

def load_qa_system(vector_store_path: str,
                   openai_api_key: str | None = None,
                   model_name: str = "gpt-3.5-turbo") -> RetrievalQA:
    """Return a LangChain RetrievalQA chain wired to FAISS index."""
    if openai_api_key is None:
        openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY missing")

    embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
    db = FAISS.load_local(vector_store_path, embeddings,
                          allow_dangerous_deserialization=True)

    set_llm_cache(SQLiteCache(database_path=".langchain.db"))

    llm = ChatOpenAI(
        openai_api_key=openai_api_key,
        model_name=model_name,
        temperature=0.2,
        max_tokens=512
    )
    qa = RetrievalQA.from_chain_type(llm=llm,
                                     retriever=db.as_retriever(search_kwargs={"k": 4}))
    return qa