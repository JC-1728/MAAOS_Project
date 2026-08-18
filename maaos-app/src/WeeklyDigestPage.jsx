import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, Users, AlertCircle } from "lucide-react";

/**
 * WeeklyDigestPage — Ann Maria's assigned screen (1 of 2)
 *
 * DATA SOURCE:
 *   TASKS            -> throughput (completed vs total)
 *   EMAILS           -> high-volume sources (grouped by sender)
 *   ANALYTICS_LOGS   -> efficiency hours + focus-consistency heatmap
 *   AGENT_LOGS       -> execution log
 */

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Demo fallback data when backend API is offline
const MOCK_TASKS = [
  { id: 1, title: "Submit Machine Learning Assignment", status: "completed" },
  { id: 2, title: "Review CS301 Lecture Notes", status: "completed" },
  { id: 3, title: "Prepare Seminar Slides", status: "completed" },
  { id: 4, title: "Lab Report - Embedded Systems", status: "pending" },
  { id: 5, title: "Register for Campus Hackathon", status: "completed" },
];

const MOCK_EMAILS = [
  { sender: "prof.sharma@univ.edu", subject_category: "Course Announcement" },
  { sender: "prof.sharma@univ.edu", subject_category: "Assignment Update" },
  { sender: "placement.cell@univ.edu", subject_category: "Drive Notification" },
  { sender: "placement.cell@univ.edu", subject_category: "Interview Schedule" },
  { sender: "placement.cell@univ.edu", subject_category: "Shortlist Announcement" },
  { sender: "library@univ.edu", subject_category: "Due Reminder" },
];

const MOCK_ANALYTICS_LOGS = [
  { metric: "hours_saved", value: 3.5, logged_at: "2026-07-21T10:00:00Z" },
  { metric: "hours_saved", value: 4.2, logged_at: "2026-07-23T14:00:00Z" },
  { metric: "hours_saved", value: 5.1, logged_at: "2026-07-25T16:00:00Z" },
  { metric: "active_day", value: 1, logged_at: new Date(Date.now() - 6*86400000).toISOString() },
  { metric: "active_day", value: 1, logged_at: new Date(Date.now() - 5*86400000).toISOString() },
  { metric: "active_day", value: 1, logged_at: new Date(Date.now() - 4*86400000).toISOString() },
  { metric: "active_day", value: 1, logged_at: new Date(Date.now() - 3*86400000).toISOString() },
  { metric: "active_day", value: 1, logged_at: new Date(Date.now() - 2*86400000).toISOString() },
  { metric: "active_day", value: 1, logged_at: new Date(Date.now() - 1*86400000).toISOString() },
  { metric: "active_day", value: 1, logged_at: new Date().toISOString() },
];

const MOCK_AGENT_LOGS = [
  { id: "1", logged_at: "10:14:02", agent_name: "SmartSearchAgent", action: "Indexed 14 new placement portal emails" },
  { id: "2", logged_at: "11:30:19", agent_name: "TriageAgent", action: "Extracted deadline: CS301 Lab (Due Friday 11:59PM)" },
  { id: "3", logged_at: "14:05:40", agent_name: "AnalyticsAgent", action: "Computed weekly productivity digest metrics" },
];

function computeThroughput(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const resolutionRate = total === 0 ? 0 : (completed / total) * 100;
  return { completed, total, resolutionRate };
}

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

function computeEfficiencyHours(analyticsLogs) {
  return analyticsLogs
    .filter((l) => l.metric === "hours_saved")
    .reduce((sum, l) => sum + l.value, 0);
}

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
    else if (i < today.getDay()) streak = 0;
    return { day: label, state: active ? "filled" : "empty" };
  });

  const todayIndex = (today.getDay() + 6) % 7;
  if (week[todayIndex]?.state === "filled") week[todayIndex].state = "streak";

  return { week, streak };
}

export default function WeeklyDigestPage({ userId = "student-demo" }) {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [emails, setEmails] = useState(MOCK_EMAILS);
  const [analyticsLogs, setAnalyticsLogs] = useState(MOCK_ANALYTICS_LOGS);
  const [agentLogs, setAgentLogs] = useState(MOCK_AGENT_LOGS);
  const [loading, setLoading] = useState(false);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDigest() {
      setLoading(true);
      try {
        // First attempt fetching consolidated weekly digest API endpoint (Ann Maria's Phase 5 API)
        const digestRes = await fetch(`/api/analytics/digest?user_id=${encodeURIComponent(userId)}&week=current`);
        if (digestRes.ok) {
          const digestData = await digestRes.json();
          if (!cancelled) {
            setTasks([
              { id: 1, title: "Completed Academic Tasks", status: "completed" },
              ...Array.from({ length: digestData.throughput.completed - 1 }, (_, i) => ({ id: i + 2, title: `Completed Task #${i + 1}`, status: "completed" })),
              ...Array.from({ length: digestData.throughput.total - digestData.throughput.completed }, (_, i) => ({ id: 100 + i, title: `Pending Task #${i + 1}`, status: "pending" }))
            ]);
            setEmails(digestData.high_volume_sources.map(s => ({ sender: s.name, subject_category: s.tag })));
            setAnalyticsLogs([
              { metric: "hours_saved", value: digestData.efficiency_hours, logged_at: new Date().toISOString() },
              ...digestData.focus_consistency.week.map(w => ({ metric: "active_day", value: w.state !== "empty" ? 1 : 0, logged_at: `${w.date}T12:00:00Z` }))
            ]);
            setAgentLogs(digestData.agent_logs || []);
            setIsUsingDemoData(false);
            return;
          }
        }

        // Fallback parallel requests
        const [tasksRes, emailsRes, logsRes] = await Promise.all([
          fetch(`/api/users/${userId}/tasks?week=current`),
          fetch(`/api/users/${userId}/emails?week=current`),
          fetch(`/api/users/${userId}/analytics-logs?week=current`),
        ]);

        if (!tasksRes.ok || !emailsRes.ok || !logsRes.ok) {
          throw new Error("Backend API not reachable; displaying local digest state.");
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

        try {
          const agentLogRes = await fetch(`/api/users/${userId}/agent-logs?hours=48`);
          if (agentLogRes.ok) {
            const agentLogData = await agentLogRes.json();
            if (!cancelled) setAgentLogs(agentLogData);
          }
        } catch {
          /* no-op */
        }
      } catch (err) {
        if (!cancelled) {
          setIsUsingDemoData(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDigest();
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

  const { completed, total, resolutionRate } = computeThroughput(tasks);
  const sources = computeTopSources(emails);
  const efficiencyHours = computeEfficiencyHours(analyticsLogs);
  const { week, streak } = computeFocusWeek(analyticsLogs);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] font-sans">
      <main className="max-w-4xl mx-auto px-10 py-12">
        {/* Banner if demo mode */}
        {isUsingDemoData && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-amber-600" />
            <span>Local demo mode active — displaying simulated student analytics.</span>
          </div>
        )}

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="border border-black/10 rounded-md p-5 bg-white shadow-sm">
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

          <div className="bg-[#111111] text-white rounded-md p-5 shadow-md">
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
            <div className="border-t border-white/15 pt-2 text-[10px] font-mono text-amber-400 font-semibold">
              RESOLUTION RATE {resolutionRate.toFixed(1)}%
            </div>
          </div>

          <div className="border border-black/10 rounded-md p-5 bg-white shadow-sm">
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
                      <div className="font-medium text-[#111]">{s.name}</div>
                      {s.tag && <div className="text-[10px] text-black/45">{s.tag}</div>}
                    </div>
                    <span className="text-[10px] font-mono border border-black/15 bg-black/5 rounded px-1.5 py-0.5 font-medium">
                      {s.count} Items
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Focus consistency */}
        <section className="mb-10 bg-white border border-black/10 rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Focus Consistency</h2>
            <span className="text-[10px] font-mono text-black/60 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-bold">
              CURRENT STREAK: {streak} DAYS
            </span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {week.map((d) => (
              <div key={d.day} className="text-center">
                <div
                  className={
                    "h-10 rounded-md mb-1 flex items-center justify-center transition-all " +
                    (d.state === "filled"
                      ? "bg-[#111111] text-white"
                      : d.state === "streak"
                      ? "bg-[#111111] text-white ring-2 ring-amber-400 shadow-sm"
                      : "border border-dashed border-black/20 bg-black/[0.02]")
                  }
                >
                  {d.state === "streak" && <span className="text-amber-400 text-sm">⚡</span>}
                </div>
                <span className="text-[10px] font-mono text-black/50 font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Agent execution log */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Agent Execution Log</h2>
            <span className="text-[10px] font-mono text-black/50">LAST 48 HOURS</span>
          </div>
          <div className="border border-black/10 rounded-md p-4 font-mono text-[11px] leading-relaxed text-black/80 bg-white min-h-[3rem] shadow-sm divide-y divide-black/5">
            {agentLogs.length === 0 ? (
              <div className="text-black/35 py-2">
                No agent log data available — add an AGENT_LOGS table to populate this section.
              </div>
            ) : (
              agentLogs.map((entry) => (
                <div key={entry.id} className="py-2 first:pt-0 last:pb-0 flex items-center gap-2">
                  <span className="text-black/40">[{entry.logged_at}]</span>
                  <span className="font-bold text-indigo-600">[{entry.agent_name}]</span>
                  <span>{entry.action}</span>
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
          <span className="hover:underline cursor-pointer">License</span>
          <span className="hover:underline cursor-pointer">Technical Specs</span>
          <span className="hover:underline cursor-pointer">Privacy</span>
        </div>
      </footer>
    </div>
  );
}
