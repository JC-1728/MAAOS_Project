"""
overlap_engine.py
Adaptive Planner Algorithm — Calendar Overlap Detection & Slot Suggestion

Phase 5 deliverable (Jessica): "Write the backend logic that detects
calendar overlaps and suggests new time slots."

This module is intentionally framework-agnostic (pure Python, no FastAPI
imports) so it can be unit-tested in isolation and wired into main.py via
a thin router layer (see overlap_routes.py).
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Optional


# ==================== DATA MODELS ====================

@dataclass
class CalendarEvent:
    """A single scheduled item — a class period, a task block, or a
    reminder window — anything with a start and end time."""
    event_id: str
    title: str
    start: datetime
    end: datetime
    source: str = "task"  # "class" | "task" | "reminder"
    priority: int = 1      # 1 = low, 5 = critical (used for suggestion ranking)

    @property
    def duration(self) -> timedelta:
        return self.end - self.start


@dataclass
class OverlapResult:
    """Describes a detected conflict between two events."""
    event_a: CalendarEvent
    event_b: CalendarEvent
    overlap_start: datetime
    overlap_end: datetime

    @property
    def overlap_minutes(self) -> int:
        return int((self.overlap_end - self.overlap_start).total_seconds() / 60)


@dataclass
class SuggestedSlot:
    """A free window the Adaptive Planner proposes as a replacement time."""
    start: datetime
    end: datetime
    duration_minutes: int
    reason: str = ""
    score: float = 0.0  # higher = better fit (see _score_slot)


@dataclass
class StudyWindowPreferences:
    """Student-configurable constraints the planner must respect."""
    day_start_hour: int = 8       # earliest a task can be scheduled
    day_end_hour: int = 22        # latest a task can be scheduled
    min_gap_minutes: int = 15     # buffer required between back-to-back events
    preferred_block_minutes: int = 60  # ideal study block length


# ==================== OVERLAP DETECTION ====================

def detect_overlaps(events: List[CalendarEvent]) -> List[OverlapResult]:
    """
    Detect all pairwise overlaps in a list of calendar events.

    Two events A and B overlap when A.start < B.end AND B.start < A.end.
    Runs in O(n log n) by sorting on start time first, then only comparing
    events whose windows could plausibly intersect.
    """
    sorted_events = sorted(events, key=lambda e: e.start)
    overlaps: List[OverlapResult] = []

    for i, current in enumerate(sorted_events):
        for other in sorted_events[i + 1:]:
            # Events are sorted by start time, so once `other` starts after
            # `current` ends, no later event can overlap `current` either.
            if other.start >= current.end:
                break

            if current.start < other.end and other.start < current.end:
                overlap_start = max(current.start, other.start)
                overlap_end = min(current.end, other.end)
                overlaps.append(
                    OverlapResult(
                        event_a=current,
                        event_b=other,
                        overlap_start=overlap_start,
                        overlap_end=overlap_end,
                    )
                )

    return overlaps


def has_conflict(candidate: CalendarEvent, existing: List[CalendarEvent]) -> bool:
    """Quick boolean check: would inserting `candidate` create any overlap
    against the existing schedule? Used before committing a reschedule."""
    for e in existing:
        if candidate.start < e.end and e.start < candidate.end:
            return True
    return False


# ==================== FREE-SLOT DISCOVERY ====================

def find_free_slots(
    events: List[CalendarEvent],
    day_start: datetime,
    day_end: datetime,
    min_duration_minutes: int = 30,
    buffer_minutes: int = 0,
) -> List[SuggestedSlot]:
    """
    Given a day's committed events, return every free window of at least
    `min_duration_minutes`, optionally padded by `buffer_minutes` on each
    side of existing events (so suggestions don't butt right up against
    a class ending).
    """
    busy = sorted(
        [
            (e.start - timedelta(minutes=buffer_minutes),
             e.end + timedelta(minutes=buffer_minutes))
            for e in events
            if e.end > day_start and e.start < day_end
        ],
        key=lambda pair: pair[0],
    )

    free_slots: List[SuggestedSlot] = []
    cursor = day_start

    for busy_start, busy_end in busy:
        busy_start = max(busy_start, day_start)
        busy_end = min(busy_end, day_end)

        if busy_start > cursor:
            gap_minutes = int((busy_start - cursor).total_seconds() / 60)
            if gap_minutes >= min_duration_minutes:
                free_slots.append(
                    SuggestedSlot(
                        start=cursor,
                        end=busy_start,
                        duration_minutes=gap_minutes,
                    )
                )
        cursor = max(cursor, busy_end)

    if cursor < day_end:
        gap_minutes = int((day_end - cursor).total_seconds() / 60)
        if gap_minutes >= min_duration_minutes:
            free_slots.append(
                SuggestedSlot(start=cursor, end=day_end, duration_minutes=gap_minutes)
            )

    return free_slots


# ==================== SLOT SCORING & SUGGESTION ====================

def _score_slot(
    slot: SuggestedSlot,
    task: CalendarEvent,
    prefs: StudyWindowPreferences,
) -> float:
    """
    Score a candidate free slot for how well it fits a task that needs
    rescheduling. Higher is better. Scoring factors:
      - Duration match: closer to the task's own duration (and the
        student's preferred block length) scores higher.
      - Earliness: sooner slots score higher (helps urgent/high-priority
        tasks land as early as possible).
      - Fragmentation penalty: a slot that's *much* longer than needed
        leaves an awkward small leftover gap, so it's scored slightly
        lower than a snug fit.
    """
    task_minutes = int(task.duration.total_seconds() / 60)
    if slot.duration_minutes < task_minutes:
        return -1  # cannot fit at all

    fit_ratio = task_minutes / slot.duration_minutes  # 1.0 = perfect fit
    fit_score = fit_ratio * 50

    # Prefer slots closer to the student's ideal block length.
    block_delta = abs(slot.duration_minutes - prefs.preferred_block_minutes)
    block_score = max(0, 30 - block_delta / 10)

    # Prefer earlier slots, especially for higher-priority tasks.
    hours_from_now = max(0, (slot.start - datetime.now()).total_seconds() / 3600)
    urgency_weight = 1 + (task.priority / 5)
    earliness_score = max(0, (48 - hours_from_now)) * 0.3 * urgency_weight

    return fit_score + block_score + earliness_score


def suggest_slots(
    task: CalendarEvent,
    all_events: List[CalendarEvent],
    search_start: datetime,
    search_end: datetime,
    prefs: Optional[StudyWindowPreferences] = None,
    max_suggestions: int = 3,
) -> List[SuggestedSlot]:
    """
    Main entry point for the Adaptive Planner. Given a task that needs a
    new time (because it currently overlaps something, or was missed),
    scan the window [search_start, search_end) day by day, find free
    slots, score them, and return the top N ranked suggestions.
    """
    prefs = prefs or StudyWindowPreferences()
    task_minutes = int(task.duration.total_seconds() / 60)
    candidates: List[SuggestedSlot] = []

    current_day = search_start.replace(hour=0, minute=0, second=0, microsecond=0)
    end_day = search_end.replace(hour=0, minute=0, second=0, microsecond=0)

    while current_day <= end_day:
        day_start = current_day.replace(hour=prefs.day_start_hour, minute=0)
        day_end = current_day.replace(hour=prefs.day_end_hour, minute=0)

        # Clip the search window to the actual requested range on the
        # first and last day.
        effective_start = max(day_start, search_start)
        effective_end = min(day_end, search_end)

        if effective_start < effective_end:
            day_events = [
                e for e in all_events
                if e.start < effective_end and e.end > effective_start
            ]
            free = find_free_slots(
                day_events,
                effective_start,
                effective_end,
                min_duration_minutes=task_minutes,
                buffer_minutes=prefs.min_gap_minutes,
            )

            for slot in free:
                # Trim the slot to exactly the task's needed duration,
                # anchored at the slot's start (earliest-fit strategy).
                proposal = SuggestedSlot(
                    start=slot.start,
                    end=slot.start + timedelta(minutes=task_minutes),
                    duration_minutes=task_minutes,
                )
                proposal.score = _score_slot(slot, task, prefs)
                if proposal.score > 0:
                    candidates.append(proposal)

        current_day += timedelta(days=1)

    candidates.sort(key=lambda s: s.score, reverse=True)

    top = candidates[:max_suggestions]
    for rank, slot in enumerate(top, start=1):
        slot.reason = _explain_slot(slot, task, rank)

    return top


def _explain_slot(slot: SuggestedSlot, task: CalendarEvent, rank: int) -> str:
    """Human-readable justification shown in the UI next to each suggestion."""
    day_label = slot.start.strftime("%A")
    time_label = f"{slot.start.strftime('%-I:%M %p')} - {slot.end.strftime('%-I:%M %p')}"
    if rank == 1:
        return f"Best fit: {day_label}, {time_label} — matches your usual study block length."
    return f"Also open: {day_label}, {time_label}"


# ==================== HIGH-LEVEL ORCHESTRATION ====================

def resolve_conflict(
    conflicted_task: CalendarEvent,
    all_events: List[CalendarEvent],
    search_horizon_days: int = 7,
    prefs: Optional[StudyWindowPreferences] = None,
) -> dict:
    """
    Full pipeline used by the /api/schedule/resolve endpoint:
      1. Confirm the task actually conflicts with something.
      2. Search forward up to `search_horizon_days` for open slots.
      3. Return the ranked suggestions plus what it originally conflicted with.

    This is the function overlap_routes.py calls directly.
    """
    others = [e for e in all_events if e.event_id != conflicted_task.event_id]
    conflicts = [
        e for e in others
        if conflicted_task.start < e.end and e.start < conflicted_task.end
    ]

    if not conflicts:
        return {
            "has_conflict": False,
            "conflicts_with": [],
            "suggestions": [],
        }

    search_start = datetime.now()
    search_end = search_start + timedelta(days=search_horizon_days)

    suggestions = suggest_slots(
        task=conflicted_task,
        all_events=others,
        search_start=search_start,
        search_end=search_end,
        prefs=prefs,
    )

    return {
        "has_conflict": True,
        "conflicts_with": [
            {"event_id": e.event_id, "title": e.title, "start": e.start.isoformat(), "end": e.end.isoformat()}
            for e in conflicts
        ],
        "suggestions": [
            {
                "start": s.start.isoformat(),
                "end": s.end.isoformat(),
                "duration_minutes": s.duration_minutes,
                "reason": s.reason,
                "score": round(s.score, 1),
            }
            for s in suggestions
        ],
    }