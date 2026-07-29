import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, Users } from "lucide-react";

/**
 * WeeklyDigestPage — Ann Maria's assigned screen (1 of 2)
 *
 * DATA SOURCE (from your schema):
 *   TASKS            -> throughput (completed vs total)
 *   EMAILS           -> high-volume sources (grouped by sender)
 *   ANALYTICS_LOGS   -> efficiency hours + focus-consistency heatmap
 *   AGENT_LOGS*       -> execution log (*not in your current schema — see note below)
 *
 * This page no longer hardcodes the finished numbers. It fetches the raw
 * rows for the signed-in user and computes the displayed stats from them,
 * the same way the real backend (Analytics Agent / Coordinator) would.
 */

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ---------------------------------------------------------------------
// Transform helpers — each one takes raw table rows (matching your
// Postgres/MySQL column names exactly) and returns what the UI needs.
// ---------------------------------------------------------------------

/** TASKS -> { completed, total, resolutionRate } */
function computeThroughput(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const resolutionRate = total === 0 ? 0 : (completed / total) * 100;
  return { completed, total, resolutionRate };
}

/** EMAILS -> top senders by volume, e.g. [{ name, tag, count }] */
function computeTopSources(emails, limit = 3) {
  const bySender = {};
  for (const e of emails) {
    if (!bySender[e.sender]) {
      bySender[e.sender] = { name: e.sender, tag: e.subject_category || "", count: 0 };
    }
    bySender[e.sender].count += 1;
  }
  return Object.values(bySender)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** ANALYTICS_LOGS (metric: 'hours_saved') -> total hours for the week */
function computeEfficiencyHours(analyticsLogs) {
  return analyticsLogs
    .filter((l) => l.metric === "hours_saved")
    .reduce((sum, l) => sum + l.value, 0);
}

/** ANALYTICS_LOGS (metric: 'active_day') -> 7-day heatmap + current streak */
function computeFocusWeek(analyticsLogs) {
  const activeDates = new Set(
    analyticsLogs.filter((l) => l.metric === "active_day").map((l) => l.logged_at.slice(0, 10))
  );

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  let streak = 0;
  const week = DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const active = activeDates.has(iso);
    if (active) streak += 1;
    else if (i < today.getDay()) streak = 0; // gap before today breaks the streak
    return { day: label, state: active ? "filled" : "empty" };
  });

  // mark today with the "streak" (lightning bolt) style if it's active
  const todayIndex = (today.getDay() + 6) % 7;
  if (week[todayIndex]?.state === "filled") week[todayIndex].state = "streak";

  return { week, streak };
}

export default function WeeklyDigestPage({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [emails, setEmails] = useState([]);
  const [analyticsLogs, setAnalyticsLogs] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDigest() {
      setLoading(true);
      setError(null);
      try {
        // Each endpoint returns rows shaped exactly like the matching
        // table in the DB design doc — no pre-aggregation on the server.
        const [tasksRes, emailsRes, logsRes] = await Promise.all([
          fetch(`/api/users/${userId}/tasks?week=current`),
          fetch(`/api/users/${userId}/emails?week=current`),
          fetch(`/api/users/${userId}/analytics-logs?week=current`),
        ]);

        if (!tasksRes.ok || !emailsRes.ok || !logsRes.ok) {
          throw new Error("One or more digest requests failed");
        }

        const [tasksData, emailsData, logsData] = await Promise.all([
          tasksRes.json(),
          emailsRes.json(),
          logsRes.json(),
        ]);

        if (cancelled) return;
        setTasks(tasksData);
        setEmails(emailsData);
        setAnalyticsLogs(logsData);

        // Optional: agent execution log. Your current schema has no
        // AGENT_LOGS table, so this endpoint may 404 — that's fine,
        // the section below just renders empty until you add one.
        try {
          const agentLogRes = await fetch(`/api/users/${userId}/agent-logs?hours=48`);
          if (agentLogRes.ok) {
            const agentLogData = await agentLogRes.json();
            if (!cancelled) setAgentLogs(agentLogData);
          }
        } catch {
          /* no-op: agent log is optional */
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (userId) loadDigest();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-black/50 font-mono text-sm">
        Loading weekly digest...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-red-600 font-mono text-sm">
        Couldn't load your digest: {error}
      </div>
    );
  }

  const { completed, total, resolutionRate } = computeThroughput(tasks);
  const sources = computeTopSources(emails);
  const efficiencyHours = computeEfficiencyHours(analyticsLogs);
  const { week, streak } = computeFocusWeek(analyticsLogs);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] font-sans">
      {/* Top nav */}
      <header className="flex items-center justify-between px-10 py-5 border-b border-black/10">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-sm">MAAOS</span>
          <span className="text-[10px] font-mono text-black/50 border border-black/15 rounded px-1.5 py-0.5">
            v1.0.4-stable
          </span>
        </div>
        <button className="text-xs font-mono border border-black/15 rounded px-3 py-1.5 hover:bg-black/5 transition-colors">
          Dashboard
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-10 py-12">
        {/* Title block */}
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-4xl font-bold tracking-tight">WEEKLY DIGEST</h1>
          <div className="text-right text-[11px] font-mono text-black/50 leading-tight">
            <div>GENERATED</div>
            <div>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-black/60 pb-6 border-b border-black/10 mb-8">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
            STATUS: NOMINAL
          </span>
          <span>USER: {userId}</span>
        </div>

        {/* Metric row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-black/10 rounded-md p-5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wide text-black/50 mb-4">
              <span>System Efficiency</span>
              <Clock size={13} strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold mb-1">
              {efficiencyHours.toFixed(1)} <span className="text-base font-medium text-black/50">HRS</span>
            </div>
            <p className="text-[11px] text-black/50 leading-snug">
              Time saved through automated triage and agent delegation this week.
            </p>
          </div>

          <div className="bg-[#111111] text-white rounded-md p-5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wide text-white/50 mb-4">
              <span>Throughput</span>
              <CheckCircle2 size={13} strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold mb-1">
              {completed}/{total}
            </div>
            <p className="text-[11px] text-white/50 mb-4 leading-snug">
              Tasks completed vs. identified.
            </p>
            <div className="border-t border-white/15 pt-2 text-[10px] font-mono">
              RESOLUTION RATE {resolutionRate.toFixed(1)}%
            </div>
          </div>

          <div className="border border-black/10 rounded-md p-5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wide text-black/50 mb-4">
              <span>High-Volume Sources</span>
              <Users size={13} strokeWidth={1.5} />
            </div>
            {sources.length === 0 ? (
              <p className="text-[11px] text-black/40">No emails logged this week.</p>
            ) : (
              <ul className="space-y-3">
                {sources.map((s) => (
                  <li key={s.name} className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      {s.tag && <div className="text-[10px] text-black/45">{s.tag}</div>}
                    </div>
                    <span className="text-[10px] font-mono border border-black/15 rounded px-1.5 py-0.5">
                      {s.count} Items
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Focus consistency */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Focus Consistency</h2>
            <span className="text-[10px] font-mono text-black/50">CURRENT STREAK: {streak} DAYS</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {week.map((d) => (
              <div key={d.day} className="text-center">
                <div
                  className={
                    "h-8 rounded-sm mb-1 flex items-center justify-center " +
                    (d.state === "filled"
                      ? "bg-[#111111]"
                      : d.state === "streak"
                      ? "bg-[#111111] ring-2 ring-amber-400"
                      : "border border-dashed border-black/20")
                  }
                >
                  {d.state === "streak" && <span className="text-amber-400 text-xs">⚡</span>}
                </div>
                <span className="text-[10px] font-mono text-black/50">{d.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Agent execution log — needs an AGENT_LOGS table; see note above */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Agent Execution Log</h2>
            <span className="text-[10px] font-mono text-black/50">LAST 48 HOURS</span>
          </div>
          <div className="border border-black/10 rounded-md p-4 font-mono text-[11px] leading-relaxed text-black/70 bg-white min-h-[3rem]">
            {agentLogs.length === 0 ? (
              <div className="text-black/35">
                No agent log data available — add an AGENT_LOGS table to populate this section.
              </div>
            ) : (
              agentLogs.map((entry) => (
                <div key={entry.id}>
                  [{entry.logged_at}] {entry.agent_name} {entry.action}
                </div>
              ))
            )}
          </div>
        </section>

        <div className="flex flex-col items-center text-[10px] font-mono text-black/40 py-6 border-t border-black/10">
          <span>END OF REPORT</span>
        </div>
      </main>

      <footer className="flex items-center justify-between px-10 py-4 border-t border-black/10 text-[10px] font-mono text-black/40">
        <span>© 2024 ACADEMIC OS KERNEL</span>
        <div className="flex gap-4">
          <span>License</span>
          <span>Technical Specs</span>
          <span>Privacy</span>
        </div>
      </footer>
    </div>
  );
}
