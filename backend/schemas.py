from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=8)
    student_id: Optional[str] = None
    institution: Optional[str] = None


class LoginRequest(BaseModel):
    identifier: str  # email or student_id
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserSettingsUpdateRequest(BaseModel):
    name: Optional[str] = None
    llm_provider: Optional[str] = None
    academic_preferences: Optional[str] = None
    notification_preferences: Optional[str] = None
    reminder_preferences: Optional[str] = None


class LLMPromptRequest(BaseModel):
    prompt: str

