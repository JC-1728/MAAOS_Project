import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.session import Base
from app.models.user import User
from app.models.oauth_token import OAuthToken
from app.models.email import Email
from app.services.gmail_service import GmailService

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

@patch("app.services.gmail_service.build")
def test_fetch_and_store_academic_emails(mock_build, db_session):
    user = User(id="gmail-user-001", name="Gmail User", email="gmail.user@univ.edu")
    token = OAuthToken(user_id=user.id)
    token.access_token = "mock_access_token"
    token.refresh_token = "mock_refresh_token"
    db_session.add_all([user, token])
    db_session.commit()

    # Mock Gmail API client service
    mock_service = MagicMock()
    mock_build.return_value = mock_service

    # Mock list messages API
    mock_messages = mock_service.users().messages()
    mock_messages.list().execute.return_value = {
        "messages": [{"id": "msg_001"}]
    }

    # Mock get message API
    mock_messages.get().execute.return_value = {
        "id": "msg_001",
        "snippet": "Midterm exam scheduled for next Wednesday at 10 AM.",
        "payload": {
            "headers": [
                {"name": "Subject", "value": "DBMS Midterm Exam Announcement"},
                {"name": "From", "value": "prof.dbms@university.edu"},
                {"name": "Date", "value": "Wed, 29 Jul 2026 10:00:00 +0000"}
            ]
        }
    }

    synced = GmailService.fetch_and_store_academic_emails(
        user_id=user.id,
        db=db_session,
        max_results=5
    )

    assert len(synced) == 1
    assert synced[0].subject == "DBMS Midterm Exam Announcement"
    assert synced[0].sender == "prof.dbms@university.edu"
    assert synced[0].google_message_id == "msg_001"
    assert "Midterm exam" in synced[0].body_snippet

    # Verify query stored emails
    stored = GmailService.get_stored_emails(user_id=user.id, db=db_session)
    assert len(stored) == 1
    assert stored[0].subject == "DBMS Midterm Exam Announcement"
