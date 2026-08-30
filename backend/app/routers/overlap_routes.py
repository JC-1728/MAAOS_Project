"""
overlap_routes.py

FastAPI router exposing the Adaptive Planner's
overlap-detection and slot-suggestion logic.
"""

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.services.overlap_engine import (
    CalendarEvent,
    StudyWindowPreferences,
    detect_overlaps,
    resolve_conflict,
)
from app.database import get_db
from app import models


router = APIRouter(
    prefix="/api/schedule",
    tags=["Adaptive Planner"]
)


# ============================================================
# REQUEST / RESPONSE SCHEMAS
# ============================================================

class EventIn(BaseModel):
    event_id: str
    title: str
    start: datetime
    end: datetime
    source: str = "task"
    priority: int = 1


class OverlapCheckRequest(BaseModel):
    events: List[EventIn]


class ConflictOut(BaseModel):
    event_id: str
    title: str
    start: datetime
    end: datetime


class SuggestionOut(BaseModel):
    start: datetime
    end: datetime
    duration_minutes: int
    reason: str
    score: float


class ResolveResponse(BaseModel):
    has_conflict: bool
    conflicts_with: List[ConflictOut]
    suggestions: List[SuggestionOut]


class ResolveRequest(BaseModel):
    task: EventIn
    context_events: List[EventIn] = []
    search_horizon_days: int = 7
    day_start_hour: int = 8
    day_end_hour: int = 22
    min_gap_minutes: int = 15
    preferred_block_minutes: int = 60


class ApplySlotRequest(BaseModel):
    task_id: int
    new_start: datetime
    new_end: datetime


# ============================================================
# HELPER
# ============================================================

def _to_calendar_event(event: EventIn) -> CalendarEvent:
    return CalendarEvent(
        event_id=event.event_id,
        title=event.title,
        start=event.start,
        end=event.end,
        source=event.source,
        priority=event.priority,
    )


# ============================================================
# OVERLAP DETECTION
# ============================================================

@router.post("/overlaps", response_model=List[dict])
def check_overlaps(payload: OverlapCheckRequest):
    """
    Detect all pairwise overlaps in the supplied events.
    """

    events = [
        _to_calendar_event(event)
        for event in payload.events
    ]

    overlaps = detect_overlaps(events)

    return [
        {
            "event_a": {
                "event_id": overlap.event_a.event_id,
                "title": overlap.event_a.title,
            },
            "event_b": {
                "event_id": overlap.event_b.event_id,
                "title": overlap.event_b.title,
            },
            "overlap_start": overlap.overlap_start.isoformat(),
            "overlap_end": overlap.overlap_end.isoformat(),
            "overlap_minutes": overlap.overlap_minutes,
        }
        for overlap in overlaps
    ]


# ============================================================
# CONFLICT RESOLUTION / RESCHEDULING (payload-based)
# ============================================================

@router.post("/resolve", response_model=ResolveResponse)
def resolve(payload: ResolveRequest):
    """
    Find conflicts for a task and suggest alternative time slots.
    Used when the frontend already holds the full event list in memory.
    """

    task = _to_calendar_event(payload.task)

    context = [
        _to_calendar_event(event)
        for event in payload.context_events
    ]

    preferences = StudyWindowPreferences(
        day_start_hour=payload.day_start_hour,
        day_end_hour=payload.day_end_hour,
        min_gap_minutes=payload.min_gap_minutes,
        preferred_block_minutes=payload.preferred_block_minutes,
    )

    result = resolve_conflict(
        conflicted_task=task,
        all_events=context + [task],
        search_horizon_days=payload.search_horizon_days,
        prefs=preferences,
    )

    return {
        "has_conflict": result["has_conflict"],
        "conflicts_with": [
            {
                "event_id": conflict["event_id"],
                "title": conflict["title"],
                "start": conflict["start"],
                "end": conflict["end"],
            }
            for conflict in result["conflicts_with"]
        ],
        "suggestions": result["suggestions"],
    }


# ============================================================
# CONFLICT RESOLUTION / RESCHEDULING (DB-backed, by task_id)
# ============================================================

@router.get("/resolve/{task_id}", response_model=ResolveResponse)
def resolve_by_task_id(
    task_id: int,
    search_horizon_days: int = 7,
    db: Session = Depends(get_db),
):
    """
    Convenience GET version: given a task_id already stored in the
    database, pull it plus the user's other tasks/schedule entries
    automatically and run the same resolution pipeline. This is the
    endpoint RescheduleButton.jsx calls — it only needs a task_id.

    Note: tasks are modeled as 1-hour blocks ending at their stored
    `deadline`, since the current schema has no explicit start_time
    column for tasks (only `schedules`, i.e. fixed classes, have one).
    """

    task_row = db.query(models.Task).filter(models.Task.task_id == task_id).first()
    if not task_row:
        raise HTTPException(status_code=404, detail="Task not found")

    if not task_row.deadline:
        raise HTTPException(status_code=400, detail="Task has no deadline set; cannot schedule")

    task = CalendarEvent(
        event_id=str(task_row.task_id),
        title=task_row.title,
        start=task_row.deadline - timedelta(hours=1),
        end=task_row.deadline,
        priority=task_row.priority or 1,
    )

    other_tasks = (
        db.query(models.Task)
        .filter(models.Task.user_id == task_row.user_id, models.Task.task_id != task_id)
        .all()
    )
    other_schedules = (
        db.query(models.Schedule)
        .filter(models.Schedule.user_id == task_row.user_id)
        .all()
    )

    context_events = []
    for t in other_tasks:
        if t.deadline:
            context_events.append(
                CalendarEvent(
                    event_id=str(t.task_id),
                    title=t.title,
                    start=t.deadline - timedelta(hours=1),
                    end=t.deadline,
                    priority=t.priority or 1,
                )
            )
    for s in other_schedules:
        context_events.append(
            CalendarEvent(
                event_id=f"sched-{s.schedule_id}",
                title=s.activity or "Class",
                start=s.start_time,
                end=s.end_time,
                source="class",
                priority=5,  # fixed class times outrank movable tasks
            )
        )

    result = resolve_conflict(
        conflicted_task=task,
        all_events=context_events + [task],
        search_horizon_days=search_horizon_days,
    )

    return {
        "has_conflict": result["has_conflict"],
        "conflicts_with": result["conflicts_with"],
        "suggestions": result["suggestions"],
    }


@router.post("/apply")
def apply_suggested_slot(payload: ApplySlotRequest, db: Session = Depends(get_db)):
    """
    Commit a chosen suggestion: update the task's deadline in the
    database to the new slot's end time. Called when the student clicks
    a specific suggestion card in the UI.
    """

    task_row = db.query(models.Task).filter(models.Task.task_id == payload.task_id).first()
    if not task_row:
        raise HTTPException(status_code=404, detail="Task not found")

    task_row.deadline = payload.new_end
    db.commit()
    db.refresh(task_row)

    return {
        "task_id": task_row.task_id,
        "title": task_row.title,
        "new_deadline": task_row.deadline.isoformat(),
        "message": "Task rescheduled successfully",
    }


# ============================================================
# HEALTH / TEST ENDPOINT
# ============================================================

@router.get("/planner-status")
def planner_status():
    """
    Simple endpoint to verify that the Adaptive Planner
    router is correctly connected to FastAPI.
    """

    return {
        "status": "online",
        "service": "Adaptive Planner",
        "message": "Overlap detection and rescheduling engine available",
    }