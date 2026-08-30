from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.analytics import WeeklyDigestResponse
from app.models.email import Email
from app.models.task import Task
from app.models.analytics_log import AnalyticsLog
from sqlalchemy import func
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/weekly-digest", response_model=WeeklyDigestResponse)
def get_weekly_digest(db: Session = Depends(get_db)):
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    # Total emails received
    total_emails = db.query(func.count(Email.id)).filter(Email.received_at >= start_date).scalar() or 0
    
    # Tasks created
    total_tasks = db.query(func.count(Task.id)).filter(Task.created_at >= start_date).scalar() or 0
    
    # Tasks completed (status='completed')
    tasks_completed = db.query(func.count(Task.id)).filter(
        Task.created_at >= start_date,
        Task.status == 'completed'
    ).scalar() or 0
    
    # Mocking top metrics based on AnalyticsLogs
    logs = db.query(
        AnalyticsLog.metric, 
        func.sum(AnalyticsLog.value).label('total_val')
    ).filter(
        AnalyticsLog.logged_at >= start_date
    ).group_by(AnalyticsLog.metric).all()
    
    top_metrics = [{"metric": log[0], "value": log[1]} for log in logs]
    
    return WeeklyDigestResponse(
        start_date=start_date,
        end_date=end_date,
        total_emails_received=total_emails,
        total_tasks_created=total_tasks,
        tasks_completed=tasks_completed,
        top_metrics=top_metrics
    )
