import pytest
from datetime import datetime, date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.session import Base
from app.models.user import User
from app.models.oauth_token import OAuthToken
from app.models.email import Email
from app.models.task import Task
from app.models.reminder import Reminder
from app.models.schedule import Schedule
from app.models.document import Document
from app.models.knowledge_chunk import KnowledgeChunk
from app.models.analytics_log import AnalyticsLog

@pytest.fixture
def db_session():
    # In-memory SQLite engine for tests
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_user_creation_and_relationships(db_session):
    user = User(name="Ann Maria", email="ann.maria@university.edu")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert user.name == "Ann Maria"

    # Add OAuth token
    token = OAuthToken(user_id=user.id)
    token.access_token = "access_secret_123"
    token.refresh_token = "refresh_secret_456"
    db_session.add(token)
    db_session.commit()

    # Check token encryption in raw DB column
    raw_token_record = db_session.query(OAuthToken).filter_by(user_id=user.id).first()
    assert raw_token_record.access_token_encrypted != "access_secret_123"
    assert raw_token_record.access_token == "access_secret_123"
    assert raw_token_record.refresh_token == "refresh_secret_456"

    # Add Email & Task
    email = Email(
        user_id=user.id,
        google_message_id="msg-101",
        subject="CS101 Assignment",
        sender="prof@univ.edu",
        body_snippet="Assignment 1 is due next week."
    )
    db_session.add(email)
    db_session.commit()

    task = Task(
        user_id=user.id,
        email_id=email.id,
        title="CS101 Assignment 1",
        priority="high",
        status="pending"
    )
    db_session.add(task)
    db_session.commit()

    assert task.email.subject == "CS101 Assignment"
    assert len(user.tasks) == 1

def test_full_schema_models(db_session):
    user = User(name="Test Student", email="student@univ.edu")
    db_session.add(user)
    db_session.commit()

    task = Task(user_id=user.id, title="Study DBMS")
    db_session.add(task)
    db_session.commit()

    reminder = Reminder(task_id=task.id, remind_at=datetime.utcnow())
    schedule = Schedule(task_id=task.id, scheduled_date=date.today(), time_slot="10:00 - 12:00")
    document = Document(user_id=user.id, filename="syllabus.pdf", file_type="pdf", extracted_text="Course info")
    db_session.add_all([reminder, schedule, document])
    db_session.commit()

    chunk = KnowledgeChunk(document_id=document.id, chunk_text="Chapter 1 summary")
    analytics = AnalyticsLog(user_id=user.id, metric="hours_studied", value=3.5)
    db_session.add_all([chunk, analytics])
    db_session.commit()

    assert db_session.query(KnowledgeChunk).count() == 1
    assert db_session.query(AnalyticsLog).count() == 1
