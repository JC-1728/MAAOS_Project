from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.oauth_token import OAuthToken
from app.core.config import settings

router = APIRouter(prefix="/auth/google", tags=["Google OAuth"])

FRONTEND_URL = "http://localhost:5173"


@router.get("/login")
def google_login(user_id: str = Query(...)):
    """
    Initiates Google OAuth. Builds the Google consent URL and returns it.
    The frontend will redirect the user's browser to this URL.
    """
    client_id = settings.GOOGLE_CLIENT_ID
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    scopes = "+".join(settings.GMAIL_SCOPES)

    auth_url = (
        f"{settings.GOOGLE_AUTH_URI}"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope={scopes}"
        f"&access_type=offline"
        f"&prompt=consent"
        f"&state={user_id}"
    )
    return {"auth_url": auth_url}


@router.get("/callback")
def google_callback(
    state: str = "",
    code: str = None,
    error: str = None,
    db: Session = Depends(get_db)
):
    """
    Handles the redirect back from Google after the user grants/denies consent.
    Exchanges the authorization code for tokens using requests (no heavy SDK needed).
    """
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/?auth=error&msg={error}")

    user_id = state

    if not code:
        return RedirectResponse(f"{FRONTEND_URL}/?auth=error&msg=Missing+authorization+code")

    import requests as req
    try:
        # Exchange authorization code for tokens
        token_response = req.post(settings.GOOGLE_TOKEN_URI, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_response.json()

        if "error" in token_data:
            return RedirectResponse(
                f"{FRONTEND_URL}/?auth=expired&msg={token_data.get('error_description', token_data['error'])}"
            )

        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in", 3600)
        scopes_str = token_data.get("scope", "")

        # Get user email from Google userinfo
        userinfo = req.get(
            settings.GOOGLE_USERINFO_URI,
            headers={"Authorization": f"Bearer {access_token}"}
        ).json()
        google_email = userinfo.get("email", "connected@gmail.com")

        # Save tokens to DB
        token_record = db.query(OAuthToken).filter(OAuthToken.user_id == user_id).first()
        if not token_record:
            token_record = OAuthToken(user_id=user_id)
            db.add(token_record)

        token_record.access_token = access_token
        if refresh_token:
            token_record.refresh_token = refresh_token
        token_record.expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        token_record.scopes = scopes_str

        db.commit()
        return RedirectResponse(f"{FRONTEND_URL}/?auth=success&user_id={user_id}")
    except Exception as e:
        db.rollback()
        return RedirectResponse(f"{FRONTEND_URL}/?auth=error&msg=Token+exchange+failed")


@router.get("/status")
def get_status(user_id: str = Query(...), db: Session = Depends(get_db)):
    """Check if a user has a valid Google OAuth connection."""
    token = db.query(OAuthToken).filter(OAuthToken.user_id == user_id).first()
    if token and token.access_token:
        return {
            "connected": True,
            "email": "connected@gmail.com",
            "expires_at": token.expires_at.isoformat() if token.expires_at else None,
            "scopes": token.scopes.split(" ") if token.scopes else ["gmail.readonly"]
        }
    return {"connected": False, "email": None, "expires_at": None, "scopes": []}


@router.post("/disconnect")
def disconnect_google(user_id: str = Query(...), db: Session = Depends(get_db)):
    """Revoke Google OAuth connection for a user."""
    db.query(OAuthToken).filter(OAuthToken.user_id == user_id).delete()
    db.commit()
    return {"status": "disconnected"}
