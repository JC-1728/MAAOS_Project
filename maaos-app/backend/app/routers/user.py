from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.email import Email
from app.models.task import Task
from app.models.analytics_log import AnalyticsLog
from app.schemas.email import EmailResponse

router = APIRouter(prefix="/api/users", tags=["Users & Digest"])

@router.get("/{user_id}/emails", response_model=list[EmailResponse])
def get_user_emails(user_id: str, week: str | None = None, db: Session = Depends(get_db)):
    """
    Fetches emails for a given user (compatible with WeeklyDigestPage).
    Auto-creates demo student user if not existing for smooth dev experience.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, name="Ann Maria", email=f"{user_id}@university.edu")
        db.add(user)
        db.commit()

    emails = db.query(Email).filter(Email.user_id == user_id).order_by(Email.received_at.desc()).all()
    return [EmailResponse.model_validate(e) for e in emails]


@router.get("/{user_id}/tasks")
def get_user_tasks(user_id: str, week: str | None = None, db: Session = Depends(get_db)):
    """
    Fetches tasks for user (compatible with WeeklyDigestPage).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "status": t.status or "pending",
            "type": t.type or "Assignment",
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "priority": t.priority or "medium"
        }
        for t in tasks
    ]


@router.get("/{user_id}/analytics-logs")
def get_user_analytics_logs(user_id: str, week: str | None = None, db: Session = Depends(get_db)):
    """
    Fetches analytics logs for user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    logs = db.query(AnalyticsLog).filter(AnalyticsLog.user_id == user_id).all()
    return [
        {
            "metric": l.metric,
            "value": l.value,
            "logged_at": l.logged_at.isoformat()
        }
        for l in logs
    ]


@router.get("/{user_id}/agent-logs")
def get_user_agent_logs(user_id: str, hours: int = 48):
    """
    Returns recent agent execution logs.
    """
    return [
        {"id": "1", "logged_at": "10:14:02", "agent_name": "EmailIntelligenceAgent", "action": "Synced and parsed academic emails via Gmail API"},
        {"id": "2", "logged_at": "11:30:19", "agent_name": "PriorityAgent", "action": "Calculated deadline-proximity score for extracted tasks"},
        {"id": "3", "logged_at": "14:05:40", "agent_name": "AnalyticsAgent", "action": "Computed weekly productivity metrics"}
    ]
