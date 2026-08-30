from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.schemas.search import SearchResponse, SearchResultItem
from app.models.email import Email
from app.models.knowledge_chunk import KnowledgeChunk
from sqlalchemy import or_
import datetime
from app.services.vector_db import vector_db

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.get("", response_model=SearchResponse)
def semantic_search(
    query: str = Query(..., description="Search query string"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    # --- Bootstrapping sync (just ensuring sqlite data is pushed to chroma) ---
    # In a full production app, this would happen on creation, not during search
    emails = db.query(Email).all()
    for e in emails:
        text = f"{e.subject or ''} {e.body_snippet or ''}"
        vector_db.upsert_email(e.id, text, str(e.received_at or e.created_at), e.sender or "", e.subject or "")

    chunks = db.query(KnowledgeChunk).all()
    for c in chunks:
        vector_db.upsert_chunk(c.id, c.chunk_text, str(c.created_at))

    # --- Proceed to Search Vectors ---
    results = []
    
    # Query Knowledge Chunks
    chunk_results = vector_db.search_chunks(query, n_results=limit)
    if chunk_results and "distances" in chunk_results and chunk_results["distances"][0]:
        for i, chunk_id in enumerate(chunk_results["ids"][0]):
            dist = chunk_results["distances"][0][i]
            # Convert euclidean distance to a naive similarity score for UI
            score = 1.0 / (1.0 + dist)
            doc_text = chunk_results["documents"][0][i]
            meta = chunk_results["metadatas"][0][i]
            results.append(SearchResultItem(
                id=chunk_id,
                type="document",
                title=f"Document Chunk",
                snippet=doc_text[:200] + "..." if len(doc_text) > 200 else doc_text,
                score=score,
                date=datetime.datetime.fromisoformat(meta.get("created_at") or str(datetime.datetime.utcnow()))
            ))

    # Query Emails
    email_results = vector_db.search_emails(query, n_results=limit)
    if email_results and "distances" in email_results and email_results["distances"][0]:
        for i, email_id in enumerate(email_results["ids"][0]):
            dist = email_results["distances"][0][i]
            score = 1.0 / (1.0 + dist)
            doc_text = email_results["documents"][0][i]
            meta = email_results["metadatas"][0][i]
            date_str = meta.get("received_at")
            if date_str and date_str != "None":
                date_obj = datetime.datetime.fromisoformat(date_str)
            else:
                date_obj = datetime.datetime.utcnow()
                
            results.append(SearchResultItem(
                id=email_id,
                type="email",
                title=meta.get("subject", "No Subject"),
                snippet=doc_text[:200] + "..." if len(doc_text) > 200 else doc_text,
                score=score,
                date=date_obj
            ))
            
    # Combine, sort, slice
    results.sort(key=lambda x: x.score, reverse=True)
    results = results[:limit]
    
    return SearchResponse(
        results=results,
        total=len(results)
    )
