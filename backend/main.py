from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import Base, engine, get_db
from models import User
from schemas import RegisterRequest, LoginRequest, TokenResponse, UserSettingsUpdateRequest, LLMPromptRequest
from auth import hash_password, verify_password, create_access_token, get_current_user
import urllib.request
import json


Base.metadata.create_all(bind=engine)

app = FastAPI(title="MAAOS Auth Module", version="1.0.4-stable")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ONLINE", "build": "STABLE_V1.04"}


@app.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        or_(User.email == payload.email, User.student_id == payload.student_id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email or student ID already exists.")

    user = User(
        name=payload.name,
        email=payload.email,
        student_id=payload.student_id,
        institution=payload.institution,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "llm_provider": user.llm_provider,
            "academic_preferences": user.academic_preferences,
            "notification_preferences": user.notification_preferences,
            "reminder_preferences": user.reminder_preferences,
        },
    )


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        or_(User.email == payload.identifier, User.student_id == payload.identifier)
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "llm_provider": user.llm_provider,
            "academic_preferences": user.academic_preferences,
            "notification_preferences": user.notification_preferences,
            "reminder_preferences": user.reminder_preferences,
        },
    )


@app.get("/users/me")
def get_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "student_id": current_user.student_id,
        "institution": current_user.institution,
        "llm_provider": current_user.llm_provider,
        "academic_preferences": current_user.academic_preferences,
        "notification_preferences": current_user.notification_preferences,
        "reminder_preferences": current_user.reminder_preferences,
    }


@app.patch("/users/me")
def update_user_profile(payload: UserSettingsUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.llm_provider is not None:
        current_user.llm_provider = payload.llm_provider
    if payload.academic_preferences is not None:
        current_user.academic_preferences = payload.academic_preferences
    if payload.notification_preferences is not None:
        current_user.notification_preferences = payload.notification_preferences
    if payload.reminder_preferences is not None:
        current_user.reminder_preferences = payload.reminder_preferences

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "student_id": current_user.student_id,
        "institution": current_user.institution,
        "llm_provider": current_user.llm_provider,
        "academic_preferences": current_user.academic_preferences,
        "notification_preferences": current_user.notification_preferences,
        "reminder_preferences": current_user.reminder_preferences,
    }


@app.get("/ollama/status")
def check_ollama_status():
    try:
        req = urllib.request.Request("http://localhost:11434/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=1.0) as response:
            if response.getcode() == 200:
                return {"status": "ONLINE", "message": "Ollama is running locally."}
    except Exception:
        pass
    return {"status": "OFFLINE", "message": "Ollama is offline or unreachable."}


@app.post("/llm/prompt")
def run_llm_prompt(payload: LLMPromptRequest, current_user: User = Depends(get_current_user)):
    provider = current_user.llm_provider

    if provider == "local":
        ollama_status = check_ollama_status()
        if ollama_status["status"] == "ONLINE":
            try:
                ollama_data = json.dumps({
                    "model": "llama3",
                    "prompt": payload.prompt,
                    "stream": False
                }).encode("utf-8")
                
                req = urllib.request.Request(
                    "http://localhost:11434/api/generate",
                    data=ollama_data,
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=8.0) as response:
                    res_json = json.loads(response.read().decode("utf-8"))
                    return {
                        "provider": "local",
                        "response": res_json.get("response", ""),
                        "warning": None
                    }
            except Exception as e:
                return {
                    "provider": "cloud",
                    "response": f"[FALLBACK] Simulated Cloud LLM Response: Failed to query Local Ollama. Prompt: {payload.prompt}",
                    "warning": "Ollama query failed. Redirected to Cloud LLM."
                }
        else:
            return {
                "provider": "cloud",
                "response": f"[FALLBACK] Simulated Cloud LLM Response: Ollama is offline. Prompt: {payload.prompt}",
                "warning": "Ollama is offline. Redirected to Cloud LLM."
            }
    
    return {
        "provider": "cloud",
        "response": f"Simulated Cloud LLM Response: Processed your academic prompt successfully.\nPrompt: \"{payload.prompt}\"",
        "warning": None
    }

