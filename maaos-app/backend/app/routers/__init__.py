from app.routers.auth import router as auth_router
from app.routers.gmail import router as gmail_router
from app.routers.user import router as user_router

__all__ = ["auth_router", "gmail_router", "user_router"]
