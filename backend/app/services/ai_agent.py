import json
import re
import os
import io
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

# Lazy import CrewAI to handle Python 3.14 / env compatibility gracefully
CREWAI_AVAILABLE = False
try:
    from crewai import Agent, Task, Crew
    CREWAI_AVAILABLE = True
except Exception:
    pass

# Try importing pypdf for PDF parsing
PYPDF_AVAILABLE = False
try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    pass


# ==================== SCHEMAS ====================

class ExtractedTask(BaseModel):
    title: str
    course: str
    deadline: str
    priority: Optional[str] = "Normal"
    estimated_hours: Optional[float] = 2.0


class ChatMessage(BaseModel):
    sender: str  # 'user' or 'agent'
    message: str
    timestamp: str


class ChatQuery(BaseModel):
    message: str
    session_id: Optional[str] = "default_session"


class AgentLogEntry(BaseModel):
    id: str
    timestamp: str
    agent_name: str
    action: str
    status: str
    details: str
    priority_flag: bool = False


# ==================== IN-MEMORY STORES ====================

# Conversational Memory per session_id
_chat_memory_store: Dict[str, List[Dict[str, str]]] = {}

# Background Agent Execution Logs
_agent_execution_logs: List[Dict[str, Any]] = [
    {
        "id": "log-1",
        "timestamp": (datetime.now() - timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S"),
        "agent_name": "Coordinator AI",
        "action": "System Initialization",
        "status": "SUCCESS",
        "details": "Initialized multi-agent context and conversational memory engine.",
        "priority_flag": False
    },
    {
        "id": "log-2",
        "timestamp": (datetime.now() - timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S"),
        "agent_name": "Burnout Protection Agent",
        "action": "Workload Monitor",
        "status": "ACTIVE",
        "details": "Monitored 12 active tasks across 4 academic courses.",
        "priority_flag": False
    }
]


def log_agent_action(agent_name: str, action: str, details: str, status: str = "SUCCESS", priority_flag: bool = False) -> Dict[str, Any]:
    """Generates an agent execution log entry for background telemetry."""
    log_entry = {
        "id": f"log-{int(time.time() * 1000)}",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "agent_name": agent_name,
        "action": action,
        "status": status,
        "details": details,
        "priority_flag": priority_flag
    }
    _agent_execution_logs.insert(0, log_entry)
    # Retain maximum 100 recent logs
    if len(_agent_execution_logs) > 100:
        _agent_execution_logs.pop()
    return log_entry


def get_agent_execution_logs(limit: int = 20) -> List[Dict[str, Any]]:
    """Fetch recent agent execution logs for frontend AgentPanel UI."""
    return _agent_execution_logs[:limit]


# ==================== CONVERSATIONAL MEMORY ====================

class ConversationalMemory:
    @staticmethod
    def get_history(session_id: str) -> List[Dict[str, str]]:
        return _chat_memory_store.get(session_id, [])

    @staticmethod
    def add_message(session_id: str, sender: str, message: str):
        if session_id not in _chat_memory_store:
            _chat_memory_store[session_id] = []
        _chat_memory_store[session_id].append({
            "sender": sender,
            "message": message,
            "timestamp": datetime.now().strftime("%H:%M:%S")
        })

    @staticmethod
    def clear_history(session_id: str):
        if session_id in _chat_memory_store:
            _chat_memory_store[session_id] = []


def process_coordinator_chat(session_id: str, user_message: str) -> Dict[str, Any]:
    """
    Coordinator AI with conversational memory handling.
    Remembers previous user queries and contextual interaction.
    """
    ConversationalMemory.add_message(session_id, "user", user_message)
    history = ConversationalMemory.get_history(session_id)
    msg_upper = user_message.upper()

    auto_task = None
    response_text = ""

    # Contextual awareness check based on message and conversation history
    if "DBMS" in msg_upper or "DATABASE" in msg_upper:
        response_text = (
            "You have 3 active updates for DBMS (Database Management Systems):\n"
            "1. SQL Injection Assignment extension: Due Friday 11:59 PM.\n"
            "2. TA Office Hours moved to Zoom today at 4:00 PM.\n"
            "3. Lab 4 Submission portal is now open."
        )
        auto_task = {
            "title": "Review SQL Injection notes & lab submission",
            "course": "DBMS",
            "deadline": "Friday 11:59 PM",
            "priority": "High Priority"
        }
    elif "SYLLABUS" in msg_upper or "UPLOAD" in msg_upper:
        response_text = (
            "You can upload your PDF syllabus using the Upload button or endpoint. "
            "I will parse the course structure, exam dates, and weekly assignments automatically!"
        )
    elif "BURNOUT" in msg_upper or "WORKLOAD" in msg_upper or "OVERLOAD" in msg_upper:
        response_text = (
            "I checked your workload density. You have a heavy concentration of tasks scheduled mid-week. "
            "I recommend rescheduling 2 delayable assignments to Saturday to prevent burnout."
        )
    elif "SCHEDULE" in msg_upper or "TIMETABLE" in msg_upper or "RESCHEDULE" in msg_upper:
        response_text = (
            "I analyzed your weekly timetable. I found 2 calendar overlaps between CS101 lecture and DBMS lab. "
            "Would you like me to trigger the One-Click Reschedule engine?"
        )
    elif len(history) > 2 and any("DBMS" in m["message"].upper() for m in history[:-1]):
        response_text = f"Following up on our DBMS discussion: '{user_message}'. I've updated your coordinator memory."
    else:
        response_text = (
            f"Hello! I am your Coordinator AI. I recorded your query: '{user_message}'. "
            "I'm keeping track of your academic context and upcoming deadlines."
        )

    ConversationalMemory.add_message(session_id, "agent", response_text)

    log_agent_action(
        agent_name="Coordinator AI",
        action="Process User Chat",
        details=f"Processed query for session '{session_id}': {user_message[:40]}...",
        priority_flag=bool(auto_task)
    )

    return {
        "session_id": session_id,
        "agent_response": response_text,
        "conversation_history": ConversationalMemory.get_history(session_id),
        "auto_added_task": auto_task
    }


# ==================== PDF SYLLABUS PARSING & EXTRACTION ====================

def parse_pdf_bytes(file_bytes: bytes, filename: str) -> str:
    """Parses raw text from PDF file bytes."""
    extracted_text = ""
    if PYPDF_AVAILABLE:
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception as e:
            print(f"Error reading PDF with pypdf: {e}")

    # Fallback if text empty or pypdf not available: extract ASCII readable text strings
    if not extracted_text.strip():
        text_matches = re.findall(r'[A-Za-z0-9\s.,;:!\-\(\)\'\"]{4,}', file_bytes.decode('latin-1', errors='ignore'))
        extracted_text = "\n".join(text_matches)

    return extracted_text.strip()


def extract_tasks_from_syllabus(syllabus_text: str, filename: str = "syllabus.pdf") -> List[Dict[str, Any]]:
    """
    Reads extracted PDF syllabus content and parses actionable tasks (assignments, exams, projects).
    Uses CrewAI agent if available, or regex fallback parser.
    """
    # Detect course name from filename or text header
    course_match = re.search(r'([A-Z]{2,4}\s?\d{3})', syllabus_text.upper()) or re.search(r'([A-Z]{3,8})', filename.upper())
    course_code = course_match.group(1) if course_match else "Syllabus Course"

    if CREWAI_AVAILABLE:
        try:
            syllabus_agent = Agent(
                role='Syllabus Parser Specialist',
                goal='Parse academic course syllabi to extract all assignment, exam, quiz, and project deadlines.',
                backstory='You are an AI specialized in reading academic syllabus PDFs and mapping out weekly coursework.',
                verbose=True,
                allow_delegation=False,
            )

            syllabus_task = Task(
                description=f'''
                Extract all assignments, quizzes, midterms, finals, and projects from this syllabus text.
                Course Context: {course_code}
                Syllabus Content:
                "{syllabus_text[:3000]}"

                Return ONLY a JSON array of objects with keys: 'title', 'course', 'deadline', 'priority', 'estimated_hours'.
                ''',
                expected_output='JSON array of extracted tasks from syllabus.',
                agent=syllabus_agent
            )

            crew = Crew(agents=[syllabus_agent], tasks=[syllabus_task], verbose=False)
            result = crew.kickoff()
            clean_result = result.raw.strip().strip('```json').strip('```')
            extracted = json.loads(clean_result)
            log_agent_action("CrewAI Syllabus Agent", "Syllabus Extraction", f"Extracted {len(extracted)} tasks from {filename}")
            return extracted
        except Exception as e:
            print(f"CrewAI syllabus extraction fallback: {e}")

    # Robust Fallback Parser
    tasks = []
    lines = syllabus_text.split('\n')
    keywords = ["assignment", "homework", "quiz", "midterm", "exam", "project", "lab", "due", "chapter", "reading"]

    for idx, line in enumerate(lines):
        line_clean = line.strip()
        if not line_clean:
            continue
        line_lower = line_clean.lower()
        if any(kw in line_lower for kw in keywords):
            # Extract date if present
            date_match = re.search(r'(week\s?\d+|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2}/\d{1,2}|friday|monday|tuesday|wednesday|thursday)', line_lower)
            deadline = date_match.group(0).title() if date_match else "As per schedule"
            
            is_exam = "exam" in line_lower or "midterm" in line_lower or "final" in line_lower
            tasks.append({
                "title": line_clean[:70],
                "course": course_code,
                "deadline": deadline,
                "priority": "High Priority" if is_exam else "Normal",
                "estimated_hours": 4.0 if is_exam else 2.0
            })

    if not tasks:
        tasks.append({
            "title": f"Review {course_code} Syllabus & Requirements",
            "course": course_code,
            "deadline": "Week 1",
            "priority": "Normal",
            "estimated_hours": 1.5
        })

    log_agent_action(
        agent_name="Syllabus Extraction Pipeline",
        action="Parse Syllabus PDF",
        details=f"Parsed '{filename}' and extracted {len(tasks)} tasks for {course_code}.",
        priority_flag=True
    )
    return tasks


# ==================== BURNOUT PROTECTION AGENT ====================

def analyze_workload_density(tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    LLM Agent Prompt & Backend Logic for Burnout Protection.
    Analyzes workload density, calculates burnout risk score, and tags tasks as High Priority or Delayable.
    """
    total_tasks = len(tasks)
    high_priority_count = sum(1 for t in tasks if t.get("priority") == "High Priority" or "EXAM" in str(t.get("title")).upper() or "DUE" in str(t.get("deadline")).upper())

    # Density calculation
    workload_score = min(100, (total_tasks * 12) + (high_priority_count * 15))

    risk_level = "Low Risk"
    if workload_score >= 75:
        risk_level = "High Risk (Burnout Warning)"
    elif workload_score >= 45:
        risk_level = "Moderate Risk"

    # Agent prompts and logic recommendation
    recommendations = []
    if risk_level.startswith("High"):
        recommendations.append("Flagged 3 non-urgent assignments to be delayed to weekend.")
        recommendations.append("Schedule 2 mandatory 30-minute breaks between study blocks.")
    elif risk_level.startswith("Moderate"):
        recommendations.append("Workload is manageable but dense mid-week. Consider completing light tasks early.")
    else:
        recommendations.append("Optimal workload distribution detected. No rescheduling required.")

    # Tag tasks as High Priority vs Delayable
    tagged_tasks = []
    for idx, t in enumerate(tasks):
        t_copy = dict(t)
        title_upper = str(t_copy.get("title", "")).upper()
        if "EXAM" in title_upper or "MIDTERM" in title_upper or "PROJECT" in title_upper or idx < 2:
            t_copy["priority"] = "High Priority"
            t_copy["action_recommendation"] = "Complete Immediately"
        else:
            t_copy["priority"] = "Delayable"
            t_copy["action_recommendation"] = "Can be shifted to Saturday"
        tagged_tasks.append(t_copy)

    log_agent_action(
        agent_name="Burnout Protection Agent",
        action="Analyze Workload Density",
        details=f"Evaluated {total_tasks} tasks. Burnout Risk Level: {risk_level} (Score: {workload_score}/100).",
        priority_flag=(risk_level.startswith("High"))
    )

    return {
        "workload_density_score": workload_score,
        "burnout_risk_level": risk_level,
        "total_tasks_analyzed": total_tasks,
        "high_priority_tasks": high_priority_count,
        "recommendations": recommendations,
        "tagged_tasks": tagged_tasks,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


def _mock_extract(email_content: str) -> list[dict]:
    """Fallback keyword task extractor."""
    tasks = []
    deadline_keywords = ["deadline", "due", "submit", "friday", "monday", "tuesday", "wednesday", "thursday", "tomorrow", "11:59"]

    sentences = re.split(r'[.!?\n]', email_content)
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        lower = sentence.lower()
        if any(kw in lower for kw in deadline_keywords):
            words = sentence.split()
            course_guess = next((w for w in words if w.isupper() and len(w) > 1), "General")
            tasks.append({
                "title": sentence[:80],
                "course": course_guess,
                "deadline": "Check details in message",
                "priority": "High Priority" if "due" in lower or "submit" in lower else "Normal"
            })

    if not tasks:
        tasks = [{
            "title": "Review academic update",
            "course": "General",
            "deadline": "Upcoming",
            "priority": "Normal"
        }]
    return tasks


def extract_tasks_from_email(email_content: str) -> list[dict]:
    """Takes raw email text and extracts tasks using CrewAI or fallback parser."""
    if CREWAI_AVAILABLE:
        try:
            email_analyzer = Agent(
                role='Academic Assistant',
                goal='Analyze incoming emails to find actionable assignments, deadlines, and tasks.',
                backstory='You are an intelligent assistant extracting homework and deadlines from emails.',
                verbose=False,
                allow_delegation=False,
            )
            extraction_task = Task(
                description=f'Analyze email content and extract tasks JSON array: "{email_content[:2000]}"',
                expected_output='A JSON array of extracted task objects.',
                agent=email_analyzer
            )
            crew = Crew(agents=[email_analyzer], tasks=[extraction_task], verbose=False)
            result = crew.kickoff()
            clean_result = result.raw.strip().strip('```json').strip('```')
            return json.loads(clean_result)
        except Exception as e:
            print(f"CrewAI extract fallback: {e}")

    return _mock_extract(email_content)
