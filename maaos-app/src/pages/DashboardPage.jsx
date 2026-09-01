import React, { useState, useEffect } from 'react';
import Navbar from "../components/dashboard/Navbar";
import TaskList from "../components/dashboard/TaskList";
import StatusCards from "../components/dashboard/StatusCards";
import QuerySection from "../components/dashboard/QuerySection";
import AgentPanel from "../components/dashboard/AgentPanel";
import ConnectionStatus from "../components/dashboard/ConnectionStatus";
import ConnectGmailButton from "../components/dashboard/ConnectGmailButton";
import WeeklyTimetable from "../components/dashboard/WeeklyTimetable";
import RescheduleButton from "../components/dashboard/RescheduleButton";
import { getTasks } from "../services/taskService";
import { connectGmail, getGmailStatus } from "../services/gmailService";
import "../styles/responsive.css";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [countdown, setCountdown] = useState({});

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data || []);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };
    loadTasks();
  }, []);

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

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  const formatTime = (days, hours, minutes, seconds) => {
    const h = String(hours ?? 0).padStart(2, '0');
    const m = String(minutes ?? 0).padStart(2, '0');
    const s = String(seconds ?? 0).padStart(2, '0');
    return days > 0 ? `${days}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
  };

  const handleConnectGmail = async () => {
    const success = await connectGmail();
    if (success) {
      setGmailConnected(true);
    }
  };

  const handleRescheduled = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to refresh tasks after reschedule:', err);
    }
  };

  return (
    <div className="dashboard-layout min-h-screen bg-gray-50 flex">
      <div className="dashboard-main flex-1 p-8">
        <div className="dashboard-header mb-8 flex justify-between items-start">
          <h1 className="text-5xl font-bold">DEADLINE RADAR</h1>
          <ConnectionStatus />
        </div>

        <div className="mb-8">
          <ConnectGmailButton
            connected={gmailConnected}
            onConnect={handleConnectGmail}
          />
        </div>

        <div className="stats-row mb-12">
          <StatusCards tasks={tasks} />
        </div>

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

        <div className="mb-12">
          <WeeklyTimetable />
        </div>

        <div className="mb-12">
          <AgentPanel />
        </div>

        <div className="mb-12">
          <QuerySection />
        </div>
      </div>
    </div>
  );
}