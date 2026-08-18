from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.session import engine, Base
import app.models  # Ensures all models are registered with Base

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multi-Agent Academic Operating System (MAAOS) - Backend API"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from app.routers.auth import router as auth_router
from app.routers.gmail import router as gmail_router
from app.routers.user import router as user_router
from app.routers.search import router as search_router
from app.routers.analytics import router as analytics_router

app.include_router(auth_router)
app.include_router(gmail_router)
app.include_router(user_router)
app.include_router(search_router)
app.include_router(analytics_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
