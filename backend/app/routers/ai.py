from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.ai_agent import (
    extract_tasks_from_email,
    process_coordinator_chat,
    parse_pdf_bytes,
    extract_tasks_from_syllabus,
    analyze_workload_density,
    get_agent_execution_logs,
    log_agent_action,
    ConversationalMemory
)

router = APIRouter()

# Shared task storage in backend
fake_tasks_db: List[Dict[str, Any]] = [
    {
        "id": "task-1",
        "title": "SQL Injection Lab Submission",
        "course": "DBMS",
        "deadline": "Friday 11:59 PM",
        "priority": "High Priority",
        "estimated_hours": 3.0
    },
    {
        "id": "task-2",
        "title": "Read Chapter 4 Vector Databases",
        "course": "AI Systems",
        "deadline": "Monday 9:00 AM",
        "priority": "Normal",
        "estimated_hours": 2.0
    },
    {
        "id": "task-3",
        "title": "Complete React PWA Service Worker setup",
        "course": "Web Engineering",
        "deadline": "Tomorrow 5:00 PM",
        "priority": "High Priority",
        "estimated_hours": 4.0
    }
]


# ==================== PYDANTIC SCHEMAS ====================

class EmailPayload(BaseModel):
    raw_email_text: str

class ChatQuery(BaseModel):
    message: str
    session_id: Optional[str] = "default_session"

class TaskItem(BaseModel):
    title: str
    course: str
    deadline: str
    priority: Optional[str] = "Normal"
    estimated_hours: Optional[float] = 2.0


# ==================== ENDPOINTS ====================

@router.post("/extract")
async def extract_and_store_tasks(payload: EmailPayload):
    """
    Extract tasks from raw email text using CrewAI/NLP pipeline and store in database.
    """
    try:
        extracted_tasks = extract_tasks_from_email(payload.raw_email_text)
        for task in extracted_tasks:
            task["id"] = f"task-{len(fake_tasks_db) + 1}"
            fake_tasks_db.append(task)
        
        log_agent_action(
            agent_name="Email Parser Agent",
            action="Extract Email Tasks",
            details=f"Extracted {len(extracted_tasks)} tasks from email content.",
            status="SUCCESS"
        )
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
    FastAPI endpoint for 'Ask Coordinator' chat handling conversational memory.
    Retains message context across queries per session_id.
    """
    try:
        session_id = query.session_id or "default_session"
        result = process_coordinator_chat(session_id=session_id, user_message=query.message)
        
        # If an auto-task was created, save to database
        if result.get("auto_added_task"):
            auto_t = result["auto_added_task"]
            auto_t["id"] = f"task-{len(fake_tasks_db) + 1}"
            fake_tasks_db.append(auto_t)

        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/coordinator-chat/history")
async def get_chat_history(session_id: str = Query("default_session")):
    """
    Returns full conversational history for a given session.
    """
    return {
        "session_id": session_id,
        "history": ConversationalMemory.get_history(session_id)
    }


@router.post("/coordinator-chat/clear")
async def clear_chat_history(session_id: str = Query("default_session")):
    """
    Clears conversational memory for a given session.
    """
    ConversationalMemory.clear_history(session_id)
    return {"message": f"Conversational memory cleared for session '{session_id}'"}


@router.post("/upload-syllabus")
async def upload_syllabus_pdf(file: UploadFile = File(...)):
    """
    Backend file upload pipeline to receive, parse, and store PDF syllabi.
    Connects CrewAI agent / syllabus parser to extract structured tasks.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported for syllabus upload."
        )

    try:
        content = await file.read()
        extracted_text = parse_pdf_bytes(content, file.filename)
        
        if not extracted_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract text from uploaded PDF file."
            )

        # Run CrewAI / syllabus task extraction pipeline
        extracted_tasks = extract_tasks_from_syllabus(extracted_text, filename=file.filename)
        
        saved_tasks = []
        for task in extracted_tasks:
            task["id"] = f"task-{len(fake_tasks_db) + 1}"
            fake_tasks_db.append(task)
            saved_tasks.append(task)

        return {
            "message": f"Syllabus '{file.filename}' uploaded, parsed, and indexed successfully.",
            "filename": file.filename,
            "parsed_character_count": len(extracted_text),
            "extracted_tasks_count": len(saved_tasks),
            "tasks": saved_tasks
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Syllabus pipeline error: {str(e)}")


@router.post("/analyze-workload")
async def analyze_burnout_risk():
    """
    Burnout Protection Agent endpoint.
    Analyzes user workload density, calculates burnout risk score, and provides actionable recommendations.
    """
    try:
        analysis = analyze_workload_density(fake_tasks_db)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/tag-priorities")
async def tag_task_priorities():
    """
    Automatically tags tasks in database as 'High Priority' or 'Delayable' based on deadline urgency and density.
    """
    try:
        analysis = analyze_workload_density(fake_tasks_db)
        tagged = analysis.get("tagged_tasks", [])
        
        # Update fake_tasks_db with new tags
        for t in tagged:
            for db_t in fake_tasks_db:
                if db_t.get("title") == t.get("title"):
                    db_t["priority"] = t.get("priority")
                    db_t["action_recommendation"] = t.get("action_recommendation")

        return {
            "message": "Tasks successfully categorized into High Priority and Delayable items.",
            "updated_tasks": fake_tasks_db
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/agent-logs")
async def fetch_agent_execution_logs(limit: int = Query(20, ge=1, le=100)):
    """
    Agent Execution Log generator endpoint.
    Returns real-time background AI telemetry for the frontend AgentPanel UI.
    """
    logs = get_agent_execution_logs(limit=limit)
    return {
        "count": len(logs),
        "logs": logs
    }


@router.post("/agent-logs/generate")
async def generate_agent_log(
    agent_name: str = Form("Burnout Protection Agent"),
    action: str = Form("Manual Telemetry Trigger"),
    details: str = Form("Triggered AI agent telemetry check from frontend UI.")
):
    """
    Trigger manual agent execution log entry.
    """
    entry = log_agent_action(agent_name=agent_name, action=action, details=details, status="SUCCESS")
    return {"message": "Agent log recorded", "log": entry}


@router.get("/tasks")
async def get_all_tasks():
    """
    Fetch all tasks stored in backend database.
    """
    return {"tasks": fake_tasks_db}


@router.post("/tasks")
async def add_task(task: TaskItem):
    """
    Add a task directly to backend database.
    """
    new_task = task.model_dump()
    new_task["id"] = f"task-{len(fake_tasks_db) + 1}"
    fake_tasks_db.append(new_task)
    
    log_agent_action(
        agent_name="Coordinator AI",
        action="Create Task",
        details=f"Created new task '{new_task['title']}' for {new_task['course']}.",
        status="SUCCESS"
    )
    return {"message": "Task added successfully", "task": new_task}
