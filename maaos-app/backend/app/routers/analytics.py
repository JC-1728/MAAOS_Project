from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.services.analytics_service import AnalyticsService
from app.models.analytics_log import AnalyticsLog

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Weekly Digest"])

class LogMetricRequest(BaseModel):
    user_id: str
    metric: str
    value: float

@router.get("/digest")
def get_weekly_digest(
    user_id: str = Query(..., description="User UUID to compute weekly digest for"),
    week: str = Query("current", description="Week identifier ('current' or 'previous')"),
    db: Session = Depends(get_db)
):
    """
    GET /api/analytics/digest: Serves aggregated weekly digest stats to the frontend,
    including throughput (completed/total tasks), system efficiency hours, top email sources,
    focus consistency heatmap, and agent logs.
    """
    return AnalyticsService.get_weekly_digest(user_id=user_id, db=db)

@router.post("/log")
def log_analytics_metric(
    payload: LogMetricRequest,
    db: Session = Depends(get_db)
):
    """
    POST /api/analytics/log: Logs telemetry/efficiency metric into the database.
    """
    log_entry = AnalyticsLog(
        user_id=payload.user_id,
        metric=payload.metric,
        value=payload.value
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return {"status": "success", "id": log_entry.id}
