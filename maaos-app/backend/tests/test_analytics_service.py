import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.session import Base
from app.models.user import User
from app.models.task import Task
from app.models.email import Email
from app.models.analytics_log import AnalyticsLog
from app.services.analytics_service import AnalyticsService

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_weekly_digest_aggregation(db_session):
    user = User(id="digest-user-101", name="Ann Maria", email="ann.m@univ.edu")
    db_session.add(user)
    db_session.commit()

    # Add tasks (3 completed, 1 pending) -> Throughput 3/4 = 75%
    tasks = [
        Task(user_id=user.id, title="Task 1", status="completed"),
        Task(user_id=user.id, title="Task 2", status="completed"),
        Task(user_id=user.id, title="Task 3", status="completed"),
        Task(user_id=user.id, title="Task 4", status="pending"),
    ]
    db_session.add_all(tasks)

    # Add emails from prof.sharma (3) and library (1)
    emails = [
        Email(user_id=user.id, google_message_id="e1", subject="Subject 1", sender="prof.sharma@univ.edu"),
        Email(user_id=user.id, google_message_id="e2", subject="Subject 2", sender="prof.sharma@univ.edu"),
        Email(user_id=user.id, google_message_id="e3", subject="Subject 3", sender="prof.sharma@univ.edu"),
        Email(user_id=user.id, google_message_id="e4", subject="Subject 4", sender="library@univ.edu"),
    ]
    db_session.add_all(emails)

    # Add hours saved analytics logs
    logs = [
        AnalyticsLog(user_id=user.id, metric="hours_saved", value=4.5),
        AnalyticsLog(user_id=user.id, metric="hours_saved", value=2.5),
        AnalyticsLog(user_id=user.id, metric="active_day", value=1.0, logged_at=datetime.utcnow()),
    ]
    db_session.add_all(logs)
    db_session.commit()

    digest = AnalyticsService.get_weekly_digest(user_id=user.id, db=db_session)

    assert digest["status"] == "success"
    assert digest["throughput"]["completed"] == 3
    assert digest["throughput"]["total"] == 4
    assert digest["throughput"]["resolutionRate"] == 75.0
    assert digest["efficiency_hours"] == 7.0
    assert len(digest["high_volume_sources"]) > 0
    assert digest["high_volume_sources"][0]["name"] == "prof.sharma@univ.edu"
    assert digest["high_volume_sources"][0]["count"] == 3
