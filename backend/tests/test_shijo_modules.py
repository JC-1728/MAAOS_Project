import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_coordinator_chat_with_memory():
    session_id = "test_session_123"

    # Turn 1: User asks about DBMS
    response1 = client.post("/ai/coordinator-chat", json={
        "message": "Do I have any DBMS assignments due?",
        "session_id": session_id
    })
    assert response1.status_code == 200
    data1 = response1.json()
    assert "agent_response" in data1
    assert "DBMS" in data1["agent_response"]
    assert len(data1["conversation_history"]) == 2  # user + agent message

    # Turn 2: Follow up query
    response2 = client.post("/ai/coordinator-chat", json={
        "message": "When is the lab due?",
        "session_id": session_id
    })
    assert response2.status_code == 200
    data2 = response2.json()
    assert len(data2["conversation_history"]) == 4  # 2 user + 2 agent messages


def test_clear_conversational_memory():
    session_id = "test_session_clear"
    client.post("/ai/coordinator-chat", json={
        "message": "Hello Coordinator!",
        "session_id": session_id
    })

    # Clear memory
    res = client.post(f"/ai/coordinator-chat/clear?session_id={session_id}")
    assert res.status_code == 200

    # Fetch history
    history_res = client.get(f"/ai/coordinator-chat/history?session_id={session_id}")
    assert history_res.status_code == 200
    assert len(history_res.json()["history"]) == 0


def test_syllabus_upload_pipeline():
    # Simulate uploading a sample PDF syllabus content
    pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nCourse Syllabus: DBMS 101\nAssignment 1 due Friday at 11:59 PM.\nMidterm Exam on Week 6."
    files = {"file": ("DBMS_Syllabus.pdf", io.BytesIO(pdf_content), "application/pdf")}

    response = client.post("/ai/upload-syllabus", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "parsed_character_count" in data
    assert data["filename"] == "DBMS_Syllabus.pdf"
    assert data["extracted_tasks_count"] >= 1


def test_burnout_workload_analysis():
    response = client.post("/ai/analyze-workload")
    assert response.status_code == 200
    data = response.json()
    assert "workload_density_score" in data
    assert "burnout_risk_level" in data
    assert "recommendations" in data


def test_tag_task_priorities():
    response = client.post("/ai/tag-priorities")
    assert response.status_code == 200
    data = response.json()
    assert "updated_tasks" in data
    tasks = data["updated_tasks"]
    assert any(t.get("priority") in ["High Priority", "Delayable", "Normal"] for t in tasks)


def test_agent_execution_logs():
    response = client.get("/ai/agent-logs")
    assert response.status_code == 200
    data = response.json()
    assert "logs" in data
    assert len(data["logs"]) >= 1
    assert "agent_name" in data["logs"][0]
