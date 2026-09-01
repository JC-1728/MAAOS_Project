import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime
from database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    """Maps to the USERS table defined in the MAAOS schema (id, name, email,
    password_hash, created_at). student_id / institution are additional
    fields captured at registration time."""

    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    student_id = Column(String, unique=True, index=True, nullable=True)
    institution = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Preferences and Settings
    llm_provider = Column(String, default="cloud", nullable=False)
    academic_preferences = Column(String, default="{}", nullable=False)
    notification_preferences = Column(String, default="{}", nullable=False)
    reminder_preferences = Column(String, default="{}", nullable=False)

