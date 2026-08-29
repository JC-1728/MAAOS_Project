import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.utils.encryption import encrypt_token, decrypt_token

class OAuthToken(Base):
    __tablename__ = "oauth_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Tokens are stored ENCRYPTED in the DB
    access_token_encrypted = Column("access_token", Text, nullable=False)
    refresh_token_encrypted = Column("refresh_token", Text, nullable=True)
    
    token_type = Column(String(50), default="Bearer")
    expires_at = Column(DateTime, nullable=True)
    scopes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="oauth_tokens")

    @property
    def access_token(self) -> str | None:
        return decrypt_token(self.access_token_encrypted)

    @access_token.setter
    def access_token(self, value: str | None):
        self.access_token_encrypted = encrypt_token(value)

    @property
    def refresh_token(self) -> str | None:
        return decrypt_token(self.refresh_token_encrypted)

    @refresh_token.setter
    def refresh_token(self, value: str | None):
        self.refresh_token_encrypted = encrypt_token(value)
