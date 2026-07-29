from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, ai

app = FastAPI(
    title="MAAOS Backend API",
    description="Backend for the Multi-Agent Academic Operating System",
    version="1.0.0"
)

# Configure CORS so Akshay's frontend can communicate with the API
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(ai.router, prefix="/ai", tags=["AI Agents"])

@app.get("/")
def read_root():
    return {"status": "online", "message": "MAAOS Backend API is running"}
