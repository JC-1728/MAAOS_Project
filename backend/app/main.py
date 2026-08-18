from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.overlap_routes import router as overlap_router

app = FastAPI(
    title="MAAOS Backend",
    version="1.0.0",
)


# ==================== CORS ====================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ROUTERS ====================

app.include_router(overlap_router)


# ==================== HEALTH CHECK ====================

@app.get("/")
def root():
    return {
        "message": "MAAOS Backend is running",
        "status": "online",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }