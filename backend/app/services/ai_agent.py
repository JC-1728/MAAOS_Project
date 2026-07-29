import json
import re
from pydantic import BaseModel

# CrewAI is imported lazily (only when actually called) to avoid Python 3.14
# compatibility crashes at server startup. The server runs fine without it
# until an LLM model is configured.
CREWAI_AVAILABLE = False
try:
    from crewai import Agent, Task, Crew
    CREWAI_AVAILABLE = True
except Exception:
    pass


class ExtractedTask(BaseModel):
    title: str
    course: str
    deadline: str


def _mock_extract(email_content: str) -> list[dict]:
    """
    Fallback parser that uses simple keyword heuristics to extract tasks
    when CrewAI/LLM is not yet configured. This keeps the API functional
    during development so the frontend team can integrate immediately.
    """
    tasks = []
    # Simple pattern: look for deadline-like keywords
    deadline_keywords = ["deadline", "due", "submit", "friday", "monday",
                         "tuesday", "wednesday", "thursday", "saturday", "sunday",
                         "tomorrow", "tonight", "11:59", "midnight"]

    sentences = re.split(r'[.!?\n]', email_content)
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        lower = sentence.lower()
        if any(kw in lower for kw in deadline_keywords):
            # Try to guess a course name from capital words
            words = sentence.split()
            course_guess = next(
                (w for w in words if w.isupper() and len(w) > 1), "General"
            )
            tasks.append({
                "title": sentence[:80],
                "course": course_guess,
                "deadline": "See email for details"
            })

    if not tasks:
        tasks = [{
            "title": "Review email for task details",
            "course": "General",
            "deadline": "Check email"
        }]

    return tasks


def extract_tasks_from_email(email_content: str) -> list[dict]:
    """
    Takes raw email text and extracts actionable tasks into structured JSON.

    - If CrewAI + a configured LLM are available, uses the full AI agent pipeline.
    - Otherwise, falls back to the keyword-based mock parser so development
      can continue without blocking on LLM setup.
    """
    if CREWAI_AVAILABLE:
        try:
            email_analyzer = Agent(
                role='Academic Assistant',
                goal='Analyze incoming emails to find actionable assignments, deadlines, and tasks.',
                backstory='You are an intelligent assistant for a student. Your job is to extract homework and project deadlines from messy emails sent by professors and TAs.',
                verbose=True,
                allow_delegation=False,
            )

            extraction_task = Task(
                description=f'''
                Analyze the following email content and extract any actionable tasks or deadlines.
                Email Content: "{email_content}"

                Extract the following fields for each task found:
                - title: A short description of the task (e.g., "Review SQL Injection notes")
                - course: The course or subject tag (e.g., "DBMS")
                - deadline: The due date or time (e.g., "Tomorrow", "Friday 11:59 PM")

                Return ONLY a JSON array of objects with the keys 'title', 'course', and 'deadline'.
                ''',
                expected_output='A JSON array of extracted task objects.',
                agent=email_analyzer
            )

            crew = Crew(
                agents=[email_analyzer],
                tasks=[extraction_task],
                verbose=True
            )

            result = crew.kickoff()

            clean_result = result.raw.strip().strip('```json').strip('```')
            tasks = json.loads(clean_result)
            return tasks

        except Exception as e:
            print(f"CrewAI pipeline failed, falling back to mock parser. Error: {e}")
            return _mock_extract(email_content)

    # CrewAI not available on this Python version — use mock parser
    print("INFO: CrewAI not available (Python 3.14 compatibility). Using mock task extractor.")
    return _mock_extract(email_content)
