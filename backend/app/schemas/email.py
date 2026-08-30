from datetime import datetime
from pydantic import BaseModel, ConfigDict

class EmailBase(BaseModel):
    subject: str | None = None
    sender: str | None = None
    body_snippet: str | None = None
    received_at: datetime | None = None
    google_message_id: str | None = None

class EmailResponse(EmailBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GmailSyncResult(BaseModel):
    status: str
    synced_count: int
    user_id: str
    emails: list[EmailResponse]
