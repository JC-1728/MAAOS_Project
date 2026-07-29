import json
from pydantic import BaseModel
from crewai import Agent, Task, Crew
import os

# Note: In production, ensure you have set your API keys as environment variables
# e.g., os.environ["OPENAI_API_KEY"] = "your-key" for LiteLLM/OpenAI
# Or configure LiteLLM to use local Ollama models

class ExtractedTask(BaseModel):
    title: str
    course: str
    deadline: str

def extract_tasks_from_email(email_content: str) -> list[dict]:
    """
    Takes raw email text (polled by Ann Maria's service) and uses CrewAI/LiteLLM 
    to extract actionable tasks into structured JSON.
    """
    
    # 1. Define the AI Agent
    email_analyzer = Agent(
        role='Academic Assistant',
        goal='Analyze incoming emails to find actionable assignments, deadlines, and tasks.',
        backstory='You are an intelligent assistant for a student. Your job is to extract homework and project deadlines from messy emails sent by professors and TAs.',
        verbose=True,
        allow_delegation=False,
        # llm=... # You can configure this to use specific LiteLLM models or Ollama here
    )

    # 2. Define the Task
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

    # 3. Form the Crew and Execute
    crew = Crew(
        agents=[email_analyzer],
        tasks=[extraction_task],
        verbose=True
    )
    
    # Execute the crew to get the result string
    result = crew.kickoff()
    
    # 4. Parse the result into JSON (In reality, you might need stronger error handling here)
    try:
        # Sometimes the LLM wraps JSON in markdown blocks
        clean_result = result.raw.strip().strip('```json').strip('```')
        tasks = json.loads(clean_result)
        return tasks
    except Exception as e:
        print(f"Error parsing JSON from LLM: {e}")
        return []

# Example usage for testing locally:
if __name__ == "__main__":
    sample_email = "Assignment 3 Update: Prof. Lee extended the deadline for the SQL Injection lab to Friday at 11:59 PM."
    # WARNING: This will fail until you set an API key for the LLM!
    # extracted = extract_tasks_from_email(sample_email)
    # print(extracted)
