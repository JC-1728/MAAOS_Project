import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.session import Base, get_db
from app.models.user import User
from app.models.oauth_token import OAuthToken

# StaticPool ensures all connections share the exact same in-memory SQLite database
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_get_google_auth_url():
    response = client.get("/auth/google/login?user_id=test-user-123")
    assert response.status_code == 200
    json_data = response.json()
    assert "auth_url" in json_data
    assert "accounts.google.com" in json_data["auth_url"]
    assert "scope=" in json_data["auth_url"]

@patch("httpx.AsyncClient.post")
@patch("httpx.AsyncClient.get")
def test_google_oauth_callback(mock_get, mock_post):
    # Mock token exchange response from Google
    mock_post_resp = MagicMock()
    mock_post_resp.status_code = 200
    mock_post_resp.json.return_value = {
        "access_token": "mock_access_token_abc123",
        "refresh_token": "mock_refresh_token_xyz789",
        "expires_in": 3600,
        "token_type": "Bearer",
        "scope": "https://www.googleapis.com/auth/gmail.readonly"
    }
    mock_post.return_value = mock_post_resp

    # Mock userinfo response from Google
    mock_get_resp = MagicMock()
    mock_get_resp.status_code = 200
    mock_get_resp.json.return_value = {
        "email": "student.ann@university.edu",
        "name": "Ann Maria"
    }
    mock_get.return_value = mock_get_resp

    response = client.get("/auth/google/callback?code=mock_authorization_code_123")
    assert response.status_code == 200
    data = response.json()
    assert data["connected"] is True
    assert data["email"] == "student.ann@university.edu"

    # Verify encrypted tokens in DB
    db = TestingSessionLocal()
    user = db.query(User).filter_by(email="student.ann@university.edu").first()
    assert user is not None
    token = db.query(OAuthToken).filter_by(user_id=user.id).first()
    assert token is not None
    assert token.access_token == "mock_access_token_abc123"
    assert token.refresh_token == "mock_refresh_token_xyz789"

def test_connection_status_and_disconnect():
    db = TestingSessionLocal()
    user = User(id="user-status-001", name="Status User", email="status@univ.edu")
    db.add(user)
    db.commit()

    # Check status when not connected
    resp_disconnected = client.get(f"/auth/google/status?user_id={user.id}")
    assert resp_disconnected.status_code == 200
    assert resp_disconnected.json()["connected"] is False

    # Connect token
    token = OAuthToken(user_id=user.id, scopes="gmail.readonly")
    token.access_token = "valid_access_token"
    db.add(token)
    db.commit()

    resp_connected = client.get(f"/auth/google/status?user_id={user.id}")
    assert resp_connected.status_code == 200
    assert resp_connected.json()["connected"] is True

    # Test Disconnect
    resp_disc = client.post(f"/auth/google/disconnect?user_id={user.id}")
    assert resp_disc.status_code == 200
    assert resp_disc.json()["status"] == "success"

    resp_after_disc = client.get(f"/auth/google/status?user_id={user.id}")
    assert resp_after_disc.json()["connected"] is False
