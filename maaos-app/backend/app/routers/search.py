from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.schemas.search import SearchResponse, SearchResultItem
from app.models.email import Email
from app.models.knowledge_chunk import KnowledgeChunk
from sqlalchemy import or_
import datetime
import math

router = APIRouter(prefix="/api/search", tags=["Search"])

def compute_mock_similarity(query_words, text):
    if not text:
         return 0.0
    text_words = set(text.lower().split())
    matches = len(query_words.intersection(text_words))
    return matches / (len(query_words) or 1)

@router.get("", response_model=SearchResponse)
def semantic_search(
    query: str = Query(..., description="Search query string"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query_lower = query.lower()
    query_words = set(query_lower.split())
    
    # 1. Fetch matching emails (mock semantic match using SQL LIKE for now, 
    # but we'll score them with a naive similarity function)
    emails = db.query(Email).all()
    
    # 2. Fetch knowledge chunks
    chunks = db.query(KnowledgeChunk).all()
    
    results = []
    
    for email in emails:
        combined_text = f"{email.subject or ''} {email.body_snippet or ''} {email.sender or ''}"
        score = compute_mock_similarity(query_words, combined_text)
        if score > 0 or query_lower in combined_text.lower():
            final_score = score if score > 0 else 0.1
            results.append(SearchResultItem(
                id=email.id,
                type="email",
                title=email.subject or "No Subject",
                snippet=email.body_snippet or "No snippet available",
                score=final_score,
                date=email.received_at or email.created_at
            ))
            
    for chunk in chunks:
        score = compute_mock_similarity(query_words, chunk.chunk_text)
        if score > 0 or query_lower in chunk.chunk_text.lower():
            final_score = score if score > 0 else 0.1
            results.append(SearchResultItem(
                id=chunk.id,
                type="document",
                title=f"Document Chunk (Doc ID: {chunk.document_id})",
                snippet=chunk.chunk_text[:200] + "..." if len(chunk.chunk_text) > 200 else chunk.chunk_text,
                score=final_score,
                date=chunk.created_at
            ))
            
    results.sort(key=lambda x: x.score, reverse=True)
    results = results[:limit]
    
    return SearchResponse(
        results=results,
        total=len(results)
    )
