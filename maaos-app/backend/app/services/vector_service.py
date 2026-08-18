import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.email import Email
from app.models.document import Document
from app.models.knowledge_chunk import KnowledgeChunk
from app.services.vector_store import VectorStore

class VectorService:
    """
    Service layer for vectorizing academic emails and performing semantic searches.
    """

    @classmethod
    def vectorize_email(cls, email: Email, db: Session) -> KnowledgeChunk:
        """
        Extracts content from an Email, creates/links a Document wrapper if necessary,
        and saves a KnowledgeChunk with vector embeddings into the database.
        """
        combined_text = f"Subject: {email.subject or ''}\nSender: {email.sender or ''}\nContent: {email.body_snippet or ''}"
        embedding_vec = VectorStore.get_embedding(combined_text)

        # Ensure a Document entry exists for this email
        doc_filename = f"Email: {email.subject[:50] if email.subject else 'Academic Email'}"
        document = db.query(Document).filter(
            Document.user_id == email.user_id,
            Document.filename == doc_filename
        ).first()

        if not document:
            document = Document(
                user_id=email.user_id,
                filename=doc_filename,
                file_type="email",
                extracted_text=combined_text
            )
            db.add(document)
            db.flush()

        # Check if KnowledgeChunk exists
        chunk = db.query(KnowledgeChunk).filter(KnowledgeChunk.document_id == document.id).first()
        if not chunk:
            chunk = KnowledgeChunk(
                document_id=document.id,
                chunk_text=combined_text,
                embedding=json.dumps(embedding_vec)
            )
            db.add(chunk)
        else:
            chunk.chunk_text = combined_text
            chunk.embedding = json.dumps(embedding_vec)

        db.commit()
        db.refresh(chunk)
        return chunk

    @classmethod
    def vectorize_user_emails(cls, user_id: str, db: Session) -> int:
        """
        Vectorizes all emails belonging to a user.
        Returns total vectorized email count.
        """
        emails = db.query(Email).filter(Email.user_id == user_id).all()
        count = 0
        for email in emails:
            cls.vectorize_email(email, db)
            count += 1
        return count

    @classmethod
    def search_user_content(
        cls,
        query: str,
        user_id: str,
        db: Session,
        filter_type: str = "all",
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Performs semantic vector search across all knowledge chunks & emails for a given user.
        """
        # Automatically ensure existing emails are vectorized if not done
        cls.vectorize_user_emails(user_id=user_id, db=db)

        # Retrieve documents for user
        user_docs = db.query(Document).filter(Document.user_id == user_id).all()
        doc_ids = [d.id for d in user_docs]

        if not doc_ids:
            return []

        # Retrieve knowledge chunks
        chunks = db.query(KnowledgeChunk).filter(KnowledgeChunk.document_id.in_(doc_ids)).all()
        
        # Build mapping from document_id to document info
        doc_map = {d.id: d for d in user_docs}

        chunk_payloads = []
        for c in chunks:
            doc = doc_map.get(c.document_id)
            if not doc:
                continue

            file_type = doc.file_type or "document"
            if filter_type != "all" and filter_type.lower() != file_type.lower():
                continue

            chunk_payloads.append({
                "chunk_id": c.id,
                "document_id": doc.id,
                "title": doc.filename,
                "type": file_type,
                "chunk_text": c.chunk_text,
                "embedding": c.embedding,
                "created_at": c.created_at.isoformat() if c.created_at else None
            })

        scored = VectorStore.search_embeddings(
            query_text=query,
            chunks=chunk_payloads,
            top_k=limit,
            min_score=0.001
        )

        results = []
        for item, score in scored:
            results.append({
                "id": item["chunk_id"],
                "document_id": item["document_id"],
                "title": item["title"],
                "type": item["type"],
                "snippet": item["chunk_text"],
                "relevance_score": float(score),
                "created_at": item["created_at"]
            })

        return results
