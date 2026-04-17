import os

import chromadb

client = chromadb.PersistentClient(
    path=os.getenv("CHROMA_DB_PATH", "./chroma_db")
)
collection = client.get_or_create_collection(name="books")

def store_embedding(doc_id, text, embedding):
    collection.add(
        ids = [str(doc_id)],
        documents = [text],
        embeddings = [embedding]
    )

def query_embedding(query_embedding):
    result = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    return result["documents"][0]
