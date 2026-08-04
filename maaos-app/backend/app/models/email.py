import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Email(Base):
    __tablename__ = "emails"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    google_message_id = Column(String(255), unique=True, nullable=True, index=True)
    subject = Column(String(500), nullable=True)
    sender = Column(String(255), nullable=True)
    body_snippet = Column(Text, nullable=True)
    received_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="emails")
    tasks = relationship("Task", back_populates="email", cascade="all, delete-orphan")
