from datetime import datetime
from pydantic import BaseModel, ConfigDict

class GoogleAuthURLResponse(BaseModel):
    auth_url: str

class GoogleOAuthCallbackParams(BaseModel):
    code: str
    state: str | None = None

class OAuthTokenResponse(BaseModel):
    user_id: str
    connected: bool
    email: str | None = None
    expires_at: datetime | None = None

class ConnectionStatusResponse(BaseModel):
    user_id: str
    connected: bool
    email: str | None = None
    expires_at: datetime | None = None
    scopes: list[str] = []

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
