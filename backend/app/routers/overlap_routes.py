"""
overlap_routes.py

FastAPI router exposing the Adaptive Planner's
overlap-detection and slot-suggestion logic.
"""

from datetime import datetime
from typing import List

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.overlap_engine import (
    CalendarEvent,
    StudyWindowPreferences,
    detect_overlaps,
    resolve_conflict,
)


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
# CONFLICT RESOLUTION / RESCHEDULING
# ============================================================

@router.post("/resolve", response_model=ResolveResponse)
def resolve(payload: ResolveRequest):
    """
    Find conflicts for a task and suggest alternative time slots.
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