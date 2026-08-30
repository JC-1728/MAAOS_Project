import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MAAOS Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./maaos.db")

    # Security & Encryption
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "b'vXwR3kQpL9m2N4j7K0s5V8x1Z3b6C9v2N5m8Q1w4E7r='")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "maaos-secret-key-super-secure-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Real Google OAuth 2.0 Credentials
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "289954342174-ipp89ovg8un0ita4itrn15idtk3upa9u.apps.googleusercontent.com")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "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")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
    GOOGLE_AUTH_URI: str = "https://accounts.google.com/o/oauth2/auth"
    GOOGLE_TOKEN_URI: str = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URI: str = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    # Gmail API Scopes
    GMAIL_SCOPES: list[str] = [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid"
    ]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
