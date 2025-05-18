from qa_system import load_qa_system
import argparse, time, logging
logging.basicConfig(level=logging.INFO)

ap = argparse.ArgumentParser()
ap.add_argument("vector_store_path")
ap.add_argument("--model", default="gpt-3.5-turbo")
ns = ap.parse_args()

qa_chain = load_qa_system(ns.vector_store_path, model_name=ns.model)
print("Type 'exit' to quit")
while True:
    q = input("> ")
    if q.lower() in {"exit", "quit"}:
        break
    st = time.time()
    print(qa_chain.invoke({"query": q})["result"])
    print(f"(took {time.time()-st:.2f}s)")