import os
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions

# By default this will download the MiniLM sentence-transformers model
default_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

class VectorDBClient:
    def __init__(self):
        # Create persistent local chroma DB in the backend folder
        db_path = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db_storage")
        print(f"Initializing ChromaDB at {db_path}...")
        self.client = chromadb.PersistentClient(path=db_path)
        
        self.chunk_collection = self.client.get_or_create_collection(
            name="knowledge_chunks",
            embedding_function=default_ef
        )
        self.email_collection = self.client.get_or_create_collection(
            name="emails",
            embedding_function=default_ef
        )

    def search_chunks(self, query: str, n_results: int = 10):
        if self.chunk_collection.count() == 0:
            return {"ids": [[]], "distances": [[]], "documents": [[]], "metadatas": [[]]}
        n = min(n_results, self.chunk_collection.count())
        return self.chunk_collection.query(query_texts=[query], n_results=n)

    def search_emails(self, query: str, n_results: int = 10):
        if self.email_collection.count() == 0:
            return {"ids": [[]], "distances": [[]], "documents": [[]], "metadatas": [[]]}
        n = min(n_results, self.email_collection.count())
        return self.email_collection.query(query_texts=[query], n_results=n)

    def upsert_email(self, email_id: str, text: str, received_at: str, sender: str, subject: str):
        self.email_collection.upsert(
            ids=[email_id],
            documents=[text],
            metadatas=[{"sender": sender or "", "subject": subject or "", "received_at": str(received_at)}]
        )
        
    def upsert_chunk(self, chunk_id: str, text: str, created_at: str):
        self.chunk_collection.upsert(
            ids=[chunk_id],
            documents=[text],
            metadatas=[{"created_at": str(created_at)}]
        )

vector_db = VectorDBClient()
