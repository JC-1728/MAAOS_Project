# backend/app/models.py
#
# TEMPORARY unblock file: defines exactly the fields overlap_routes.py
# reads (models.Task.task_id/title/deadline/priority/user_id and
# models.Schedule.schedule_id/start_time/end_time/activity/user_id).
#
# Replace with your teammate's real models.py once you have it — but if
# their Task/Schedule classes use DIFFERENT field names, tell me what
# they are and I'll adjust overlap_routes.py to match instead of forcing
# you to rename their columns.

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password_hash = Column(String(255))
    first_name = Column(String(100))


class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    deadline = Column(DateTime)
    priority = Column(Integer, default=1)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)


class Schedule(Base):
    __tablename__ = "schedules"

    schedule_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    activity = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)