from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.ai_agent import extract_tasks_from_email

router = APIRouter()

# Temporary in-memory task database (until Ann Maria builds the real database)
fake_tasks_db = []

# Pydantic Schemas to match the Figma UI Design Data Needs
class EmailPayload(BaseModel):
    raw_email_text: str

class ChatQuery(BaseModel):
    message: str

@router.post("/extract")
async def extract_and_store_tasks(payload: EmailPayload):
    """
    Powers the "Smart Inbox" Figma Design (Raw Input -> Extracted Tasks).
    This takes raw email content, uses the AI agent to parse it into JSON, 
    and stores it in the database.
    """
    try:
        # Run the CrewAI agent to extract structured tasks
        extracted_tasks = extract_tasks_from_email(payload.raw_email_text)
        
        # Save each task to our database
        for task in extracted_tasks:
            fake_tasks_db.append(task)
            
        return {
            "message": "Tasks successfully extracted and saved", 
            "extracted_count": len(extracted_tasks),
            "tasks": extracted_tasks
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/coordinator-chat")
async def chat_with_coordinator(query: ChatQuery):
    """
    Powers the "Coordinator Agent Initialized" chat UI from the Figma Design.
    """
    # Dummy response perfectly matching the Figma chat mockup
    if "DBMS" in query.message.upper():
        response_text = (
            "You received 3 emails related to DBMS (Database Management Systems) this morning:\n\n"
            "- Assignment 3 Update: Prof. Lee extended the deadline for the SQL Injection lab to Friday at 11:59 PM.\n"
            "- TA Office Hours: The TA moved today's office hours to Zoom instead of the lab room."
        )
        # We can also simulate adding a task directly from chat as shown in the design
        extracted_task = {
            "title": "Review SQL Injection notes",
            "course": "DBMS",
            "deadline": "TOMORROW"
        }
        fake_tasks_db.append(extracted_task)
        
        return {
            "agent_response": response_text,
            "auto_added_task": extracted_task
        }
        
    return {"agent_response": f"I am the Coordinator Agent. I received your message: {query.message}"}

@router.get("/tasks")
async def get_all_tasks():
    """
    Jessica will use this endpoint to fetch the tasks and display them 
    in the 'DEADLINE RADAR' dashboard as seen in the Figma design.
    """
    return {"tasks": fake_tasks_db}
