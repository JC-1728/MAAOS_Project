from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.services.gmail_service import GmailService
from app.schemas.email import EmailResponse, GmailSyncResult

router = APIRouter(prefix="/api/gmail", tags=["Gmail API"])

@router.post("/sync", response_model=GmailSyncResult)
def sync_academic_emails(
    user_id: str = Query(..., description="User UUID to sync emails for"),
    max_results: int = Query(10, description="Max emails to fetch from Gmail"),
    query: str = Query("", description="Optional search query filter"),
    db: Session = Depends(get_db)
):
    """
    Triggers academic email polling from connected Gmail account using Gmail API
    and stores parsed emails into database.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")

    try:
        synced_emails = GmailService.fetch_and_store_academic_emails(
            user_id=user_id,
            db=db,
            max_results=max_results,
            query=query
        )
        email_responses = [EmailResponse.model_validate(e) for e in synced_emails]
        return GmailSyncResult(
            status="success",
            synced_count=len(email_responses),
            user_id=user_id,
            emails=email_responses
        )
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync academic emails: {str(err)}"
        )


@router.get("/emails", response_model=list[EmailResponse])
def get_user_emails(
    user_id: str = Query(..., description="User UUID"),
    limit: int = Query(20, description="Limit count"),
    db: Session = Depends(get_db)
):
    """
    Fetches synced academic emails for user from the database.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")

    emails = GmailService.get_stored_emails(user_id=user_id, db=db, limit=limit)
    return [EmailResponse.model_validate(e) for e in emails]
