# backend/app/database.py
#
# TEMPORARY unblock file: this gets `from app.database import get_db, engine`
# working TODAY so overlap_routes.py can import successfully and uvicorn
# can start. Replace the DATABASE_URL below with your team's real MySQL
# credentials, or swap this whole file for your teammate's actual
# database.py once you get it — the shape (get_db, engine, Base) is what
# overlap_routes.py and models.py depend on, so keep those three names
# the same even if you replace the internals.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/maaos_db"

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency used by FastAPI routes: `db: Session = Depends(get_db)`."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()