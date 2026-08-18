import email.utils
from datetime import datetime
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.core.config import settings
from app.models.oauth_token import OAuthToken
from app.models.email import Email

class GmailService:

    @staticmethod
    def get_credentials(user_id: str, db: Session) -> Credentials:
        """
        Retrieves stored encrypted OAuth tokens, decrypts them, builds Google Credentials,
        and refreshes the token if expired.
        """
        token_record = db.query(OAuthToken).filter(OAuthToken.user_id == user_id).first()
        if not token_record:
            raise ValueError(f"No OAuth tokens found for user_id: {user_id}")

        access_token = token_record.access_token
        refresh_token = token_record.refresh_token

        if not access_token:
            raise ValueError("Invalid OAuth record: Missing access token.")

        scopes = token_record.scopes.split(" ") if token_record.scopes else settings.GMAIL_SCOPES

        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri=settings.GOOGLE_TOKEN_URI,
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=scopes
        )

        if credentials.expired and credentials.refresh_token:
            try:
                credentials.refresh(Request())
                token_record.access_token = credentials.token
                if credentials.expiry:
                    token_record.expires_at = credentials.expiry
                db.commit()
                db.refresh(token_record)
            except Exception as err:
                db.rollback()
                raise ValueError(f"Failed to refresh OAuth token: {str(err)}")

        return credentials

    @classmethod
    def fetch_and_store_academic_emails(
        cls, 
        user_id: str, 
        db: Session, 
        max_results: int = 10, 
        query: str = ""
    ) -> list[Email]:
        """
        Polls Gmail API for recent academic emails, extracts headers and snippets,
        and saves them into PostgreSQL/MySQL/SQLite DB.
        """
        credentials = cls.get_credentials(user_id, db)
        service = build('gmail', 'v1', credentials=credentials)

        try:
            # Fetch message listing
            response = service.users().messages().list(
                userId='me', 
                maxResults=max_results, 
                q=query
            ).execute()
        except HttpError as http_err:
            if "insufficientPermissions" in str(http_err) or "disabled" in str(http_err):
                raise ValueError("Gmail API access requires enabling 'Gmail API' in your Google Cloud Console (APIs & Services -> Library -> Gmail API -> Enable).")
            raise ValueError(f"Gmail API HttpError: {str(http_err)}")

        messages = response.get('messages', [])
        synced_emails = []

        for msg_meta in messages:
            msg_id = msg_meta['id']
            
            existing = db.query(Email).filter(Email.google_message_id == msg_id).first()
            if existing:
                synced_emails.append(existing)
                continue

            msg_detail = service.users().messages().get(
                userId='me', 
                id=msg_id, 
                format='full'
            ).execute()

            headers = msg_detail.get('payload', {}).get('headers', [])
            subject = None
            sender = None
            date_str = None

            for h in headers:
                name = h.get('name', '').lower()
                if name == 'subject':
                    subject = h.get('value')
                elif name == 'from':
                    sender = h.get('value')
                elif name == 'date':
                    date_str = h.get('value')

            body_snippet = msg_detail.get('snippet', '')
            received_at = datetime.utcnow()
            if date_str:
                try:
                    parsed_tuple = email.utils.parsedate_tz(date_str)
                    if parsed_tuple:
                        timestamp = email.utils.mktime_tz(parsed_tuple)
                        received_at = datetime.utcfromtimestamp(timestamp)
                except Exception:
                    pass

            email_record = Email(
                user_id=user_id,
                google_message_id=msg_id,
                subject=subject or "No Subject",
                sender=sender or "Unknown Sender",
                body_snippet=body_snippet,
                received_at=received_at
            )
            db.add(email_record)
            db.commit()
            db.refresh(email_record)

            # Auto-vectorize for smart search
            try:
                from app.services.vector_service import VectorService
                VectorService.vectorize_email(email_record, db)
            except Exception:
                pass

            synced_emails.append(email_record)

        return synced_emails

    @staticmethod
    def get_stored_emails(user_id: str, db: Session, limit: int = 20) -> list[Email]:
        """
        Fetches stored emails for a user from database.
        """
        return db.query(Email).filter(Email.user_id == user_id).order_by(Email.received_at.desc()).limit(limit).all()
