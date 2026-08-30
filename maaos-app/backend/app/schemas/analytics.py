from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class WeeklyDigestResponse(BaseModel):
    start_date: datetime
    end_date: datetime
    total_emails_received: int
    total_tasks_created: int
    tasks_completed: int
    top_metrics: List[Dict[str, Any]]
