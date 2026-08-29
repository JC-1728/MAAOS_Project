import React, { useState, useEffect } from 'react';
import Navbar from "../components/dashboard/Navbar";
import TaskList from "../components/dashboard/TaskList";
import StatusCards from "../components/dashboard/StatusCards";
import QuerySection from "../components/dashboard/QuerySection";
import AgentPanel from "../components/dashboard/AgentPanel";
import { getTasks } from "../services/taskService";
import ConnectionStatus from "../components/dashboard/ConnectionStatus";
import ConnectGmailButton from "../components/dashboard/ConnectGmailButton";
import WeeklyTimetable from "../components/dashboard/WeeklyTimetable";
import {
  connectGmail,
  getGmailStatus,
} from "../services/gmailService";
import RescheduleButton from "../components/dashboard/RescheduleButton";
export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [gmailConnected, setGmailConnected] = useState(false);
import "../styles/responsive.css";
  // Countdown timer effect


  useEffect(() => {
    const loadTasks = async () => {
      const data = await getTasks();
      setTasks(data);

      // Initialize countdown using the first task

    };

    loadTasks();
  }, []);
  useEffect(() => {
    const loadGmailStatus = async () => {
      const status = await getGmailStatus();
      setGmailConnected(status);
    };

    loadGmailStatus();
  }, []);



  const handleConnectGmail = async () => {
    const success = await connectGmail();
    if (success) {
      setGmailConnected(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <Navbar />


      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-gray-500 font-mono mb-2">v1.0.6-STABLE</p>
                <h1 className="text-5xl font-bold mb-4">DEADLINE RADAR</h1>
                <p className="text-gray-700 max-w-2xl">
                  High-density overview of impending academic obligations. Prioritize task execution sequence based on remaining temporal distance.
                </p>
              </div>
              <div className="text-right text-xs font-mono text-gray-500">
                <div>● SYSTEM: ONLINE</div>
                <div>🔴 RADAR: ENGAGED</div>
                <div className="mt-2 text-gray-600">SYS-TIME: 11:23:56 UTC</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-8">
            <ConnectionStatus connected={gmailConnected} />

            <ConnectGmailButton
              connected={gmailConnected}
              onConnect={handleConnectGmail}
            />
          </div>
          {/* Priority Queue */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-mono">PRIORITY QUEUE (TOP 3)</h2>
              <RescheduleButton />
            </div>

            <TaskList
              tasks={tasks}
              countdown={countdown}
              formatTime={formatTime}
            />
          </div>

          {/* Task Delegation Agents */}
          <AgentPanel />

          {/* Metrics Cards */}
          <StatusCards />
          {/* Weekly Timetable */}
          <WeeklyTimetable />

          {/* Chat/Query Section */}
          <QuerySection />
        </div>
      </div>
    </div>

  );
}
