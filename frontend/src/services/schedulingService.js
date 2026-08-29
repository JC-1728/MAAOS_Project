const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Ask the backend Adaptive Planner to find
 * alternative time slots for a conflicted task.
 */
export async function rescheduleTasks(task, contextEvents = []) {
  const response = await fetch(`${API_BASE_URL}/api/schedule/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task: {
        event_id: String(task.task_id ?? task.id),
        title: task.title,
        start: task.start,
        end: task.end,
        source: "task",
        priority: task.priority ?? 1,
      },
      context_events: contextEvents.map((event) => ({
        event_id: String(event.task_id ?? event.id ?? event.event_id),
        title: event.title,
        start: event.start,
        end: event.end,
        source: event.source ?? "task",
        priority: event.priority ?? 1,
      })),
      search_horizon_days: 7,
      day_start_hour: 8,
      day_end_hour: 22,
      min_gap_minutes: 15,
      preferred_block_minutes: 60,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to reschedule task");
  }

  return await response.json();
}

export default {
  rescheduleTasks,
};