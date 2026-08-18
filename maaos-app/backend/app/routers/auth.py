from datetime import datetime, timedelta
from urllib.parse import urlencode
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User
from app.models.oauth_token import OAuthToken
from app.schemas.auth import (
    GoogleAuthURLResponse,
    OAuthTokenResponse,
    ConnectionStatusResponse
)

router = APIRouter(prefix="/auth/google", tags=["Google OAuth"])

@router.get("/login", response_model=GoogleAuthURLResponse)
def get_google_auth_url(user_id: str | None = None):
    """
    Generates Google OAuth 2.0 authorization consent URL for Gmail API connection.
    """
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(settings.GMAIL_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": user_id or "default_session"
    }
    auth_url = f"{settings.GOOGLE_AUTH_URI}?{urlencode(params)}"
    return GoogleAuthURLResponse(auth_url=auth_url)


@router.get("/callback", response_model=OAuthTokenResponse)
async def google_oauth_callback(
    code: str = Query(..., description="Authorization code returned by Google OAuth"),
    state: str | None = Query(None, description="User ID or state token"),
    db: Session = Depends(get_db)
):
    """
    Handles Google OAuth callback:
    1. Exchanges authorization code for access & refresh tokens.
    2. Fetches user info from Google.
    3. Creates/retrieves User in database.
    4. Encrypts and saves OAuth access and refresh tokens.
    """
    # 1. Exchange authorization code for tokens
    token_payload = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(settings.GOOGLE_TOKEN_URI, data=token_payload)
        
        if token_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to exchange code for OAuth tokens: {token_resp.text}"
            )
        
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in", 3600)
        token_type = token_data.get("token_type", "Bearer")
        scopes_str = token_data.get("scope", "")

        # 2. Fetch User Profile from Google UserInfo API
        userinfo_resp = await client.get(
            settings.GOOGLE_USERINFO_URI,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if userinfo_resp.status_code == 200:
            user_info = userinfo_resp.json()
            user_email = user_info.get("email")
            user_name = user_info.get("name", user_email)
        else:
            user_email = f"google_user_{code[:6]}@gmail.com"
            user_name = "Connected Student"

    # 3. Create or find User in DB
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        user = User(
            name=user_name,
            email=user_email
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

    # 4. Store encrypted OAuth tokens
    token_record = db.query(OAuthToken).filter(OAuthToken.user_id == user.id).first()
    if not token_record:
        token_record = OAuthToken(
            user_id=user.id,
            token_type=token_type,
            expires_at=expires_at,
            scopes=scopes_str
        )
        # Using model setter which automatically encrypts access_token and refresh_token
        token_record.access_token = access_token
        token_record.refresh_token = refresh_token
        db.add(token_record)
    else:
        token_record.access_token = access_token
        if refresh_token:
            token_record.refresh_token = refresh_token
        token_record.expires_at = expires_at
        token_record.scopes = scopes_str
        token_record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(token_record)

    return OAuthTokenResponse(
        user_id=user.id,
        connected=True,
        email=user.email,
        expires_at=token_record.expires_at
    )


@router.get("/status", response_model=ConnectionStatusResponse)
def get_connection_status(user_id: str, db: Session = Depends(get_db)):
    """
    Checks Gmail API OAuth connection status for a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    token_record = db.query(OAuthToken).filter(OAuthToken.user_id == user_id).first()
    if not token_record or not token_record.access_token:
        return ConnectionStatusResponse(
            user_id=user_id,
            connected=False,
            email=user.email,
            expires_at=None,
            scopes=[]
        )

    scopes_list = token_record.scopes.split(" ") if token_record.scopes else []
    return ConnectionStatusResponse(
        user_id=user_id,
        connected=True,
        email=user.email,
        expires_at=token_record.expires_at,
        scopes=scopes_list
    )


@router.post("/disconnect")
def disconnect_gmail(user_id: str, db: Session = Depends(get_db)):
    """
    Disconnects Gmail OAuth account by removing stored tokens.
    """
    token_record = db.query(OAuthToken).filter(OAuthToken.user_id == user_id).first()
    if token_record:
        db.delete(token_record)
        db.commit()
        return {"status": "success", "message": "Gmail account disconnected successfully."}
    return {"status": "success", "message": "No connected Gmail account found."}
