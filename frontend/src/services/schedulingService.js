// src/services/schedulingService.js
// Adaptive Planner service layer — calls the FastAPI /api/schedule/* routes.
// Every function used by RescheduleButton.jsx is exported here explicitly,
// by exact name, so import errors like "does not provide an export named
// 'applySuggestedSlot'" cannot happen again.

const API_BASE = 'http://localhost:8000/api/schedule';

/**
 * Check a list of events for pairwise overlaps.
 */
export async function checkOverlaps(events) {
  const response = await fetch(`${API_BASE}/overlaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  });
  if (!response.ok) throw new Error(`Overlap check failed: ${response.status}`);
  return response.json();
}

/**
 * Get ranked suggested time slots for a task already saved in the DB.
 * This is what RescheduleButton calls when the user clicks the button.
 */
export async function getSuggestedSlots(taskId, searchHorizonDays = 7) {
  const response = await fetch(
    `${API_BASE}/resolve/${taskId}?search_horizon_days=${searchHorizonDays}`
  );
  if (!response.ok) throw new Error(`Failed to get suggestions: ${response.status}`);
  return response.json();
}

/**
 * Get suggestions by passing full event context directly (used if you
 * already hold the schedule in frontend state).
 */
export async function resolveConflict(task, contextEvents = [], options = {}) {
  const {
    searchHorizonDays = 7,
    dayStartHour = 8,
    dayEndHour = 22,
    minGapMinutes = 15,
    preferredBlockMinutes = 60,
  } = options;

  const response = await fetch(`${API_BASE}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task,
      context_events: contextEvents,
      search_horizon_days: searchHorizonDays,
      day_start_hour: dayStartHour,
      day_end_hour: dayEndHour,
      min_gap_minutes: minGapMinutes,
      preferred_block_minutes: preferredBlockMinutes,
    }),
  });
  if (!response.ok) throw new Error(`Resolve failed: ${response.status}`);
  return response.json();
}

/**
 * Commit a chosen suggestion — updates the task's deadline in the DB.
 * MUST be named exactly `applySuggestedSlot` — RescheduleButton.jsx
 * imports it by this exact name.
 */
export async function applySuggestedSlot(taskId, newStart, newEnd) {
  const response = await fetch(`${API_BASE}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task_id: taskId,
      new_start: newStart,
      new_end: newEnd,
    }),
  });
  if (!response.ok) throw new Error(`Apply failed: ${response.status}`);
  return response.json();
}

export const rescheduleTasks = resolveConflict;

// Default export too, in case any file imports the whole module instead
// of named exports.
export default {
  checkOverlaps,
  getSuggestedSlots,
  resolveConflict,
  rescheduleTasks,
  applySuggestedSlot,
};