from pydantic import BaseModel, Field
from typing import List, Optional

class SearchResultItem(BaseModel):
    id: str
    document_id: str
    title: str
    type: str = "document"
    snippet: str
    relevance_score: float
    created_at: Optional[str] = None

class SearchResponse(BaseModel):
    status: str = "success"
    query: str
    total_matches: int
    filter_type: str = "all"
    results: List[SearchResultItem]
