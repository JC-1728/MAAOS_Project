import React, { useState, useEffect } from 'react';

// From src/pages/DashboardPage.jsx: go up one level (../) to reach src/,
// then down into components/dashboard/ or services/.

import ConnectionStatus from '../components/dashboard/ConnectionStatus';
import ConnectGmailButton from '../components/dashboard/ConnectGmailButton';
import StatusCards from '../components/dashboard/StatusCards';
import TaskList from '../components/dashboard/TaskList';
import RescheduleButton from '../components/dashboard/RescheduleButton';
import WeeklyTimetable from '../components/dashboard/WeeklyTimetable';
import QuerySection from '../components/dashboard/QuerySection';
import AgentPanel from '../components/dashboard/AgentPanel';

import { getTasks } from '../services/taskService';
import ThemeSettingsPanel from '../components/ThemeSettingsPanel';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [countdown, setCountdown] = useState({});

  // ==================== LOAD TASKS ====================
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };
    loadTasks();
  }, []);

  // ==================== LIVE COUNTDOWN ====================
  // Recomputes every second for whichever task is soonest-due (tasks[0]
  // is assumed to already be sorted by deadline — adjust if not).
  useEffect(() => {
    if (!tasks.length) return;

    const topTask = tasks[0];
    if (!topTask?.deadline) return;

    const tick = () => {
      const deadline = new Date(topTask.deadline).getTime();
      const now = Date.now();
      const diff = Math.max(0, deadline - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
    };

    tick(); // run immediately so there's no 1s blank flash
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  // ==================== FORMAT HELPER ====================
  const formatTime = (days, hours, minutes, seconds) => {
    const h = String(hours ?? 0).padStart(2, '0');
    const m = String(minutes ?? 0).padStart(2, '0');
    const s = String(seconds ?? 0).padStart(2, '0');
    return days > 0 ? `${days}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
  };

  // ==================== RESCHEDULE CALLBACK ====================
  // When a task is rescheduled, refresh the task list so the countdown
  // and timetable both reflect the new deadline immediately.
  const handleRescheduled = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to refresh tasks after reschedule:', err);
    }
  };

  return (
    <div className="dashboard-layout min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex">
      <ThemeSettingsPanel />
      <div className="dashboard-main flex-1 p-8">
        <div className="dashboard-header mb-8 flex justify-between items-start">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600">DEADLINE RADAR</h1>
          <ConnectionStatus />
        </div>

        <div className="mb-8">
          <ConnectGmailButton />
        </div>

        <div className="stats-row mb-12">
          <StatusCards tasks={tasks} />
        </div>

        {/* Priority Queue with live countdown + reschedule per task */}
        <div className="mb-12">
          <TaskList tasks={tasks} countdown={countdown} formatTime={formatTime} />

          {tasks.length > 0 && (
            <div className="mt-4">
              <RescheduleButton
                taskId={tasks[0].task_id}
                onRescheduled={handleRescheduled}
              />
            </div>
          )}
        </div>

        {/* Weekly Timetable */}
        <div className="mb-12">
          <WeeklyTimetable />
        </div>

        <div className="mb-12">
          <QuerySection />
        </div>

        <div className="mb-12">
          <AgentPanel />
        </div>
      </div>
    </div>
  );
}