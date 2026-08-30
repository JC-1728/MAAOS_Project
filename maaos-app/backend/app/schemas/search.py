from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 10

class SearchResultItem(BaseModel):
    id: str
    type: str # 'email' or 'document'
    title: str
    snippet: str
    score: float
    date: datetime

class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    total: int
