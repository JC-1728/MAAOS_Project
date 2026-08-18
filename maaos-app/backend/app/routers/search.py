from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.services.vector_service import VectorService
from app.schemas.search import SearchResponse, SearchResultItem

router = APIRouter(prefix="/api/search", tags=["Smart Search & Vectorization"])

@router.get("", response_model=SearchResponse)
def search_documents_and_emails(
    q: str = Query(..., description="Query text to perform semantic vector search"),
    user_id: str = Query(..., description="User UUID"),
    filter_type: str = Query("all", description="Type filter: 'all', 'email', or 'document'"),
    limit: int = Query(10, description="Max search results to return"),
    db: Session = Depends(get_db)
):
    """
    GET /api/search: Queries vectorized academic emails & documents using vector similarity.
    Returns relevance-scored document/email snippets matching the user's semantic query.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Create user if demo ID provided
        user = User(id=user_id, name="Ann Maria", email=f"{user_id}@university.edu")
        db.add(user)
        db.commit()

    results_data = VectorService.search_user_content(
        query=q,
        user_id=user_id,
        db=db,
        filter_type=filter_type,
        limit=limit
    )

    items = [SearchResultItem(**item) for item in results_data]

    return SearchResponse(
        status="success",
        query=q,
        total_matches=len(items),
        filter_type=filter_type,
        results=items
    )
