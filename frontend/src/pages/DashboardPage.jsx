import React, { useState, useEffect } from 'react';
import Navbar from "../components/dashboard/Navbar";
import TaskList from "../components/dashboard/TaskList";
import StatusCards from "../components/dashboard/StatusCards";
import QuerySection from "../components/dashboard/QuerySection";
import AgentPanel from "../components/dashboard/AgentPanel";
import { getTasks } from "../services/taskService";
import ConnectionStatus from "../components/dashboard/ConnectionStatus";
import ConnectGmailButton from "../components/dashboard/ConnectGmailButton";
import {
  connectGmail,
  getGmailStatus,
} from "../services/gmailService";
export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [countdown, setCountdown] = useState({});
  const [gmailConnected, setGmailConnected] = useState(false);
  // Countdown timer effect


  useEffect(() => {
    const loadTasks = async () => {
      const data = await getTasks();
      setTasks(data);

      // Initialize countdown using the first task
      if (data.length > 0) {
        setCountdown(data[0].deadline);
      }
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
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let newSecs = (prev.seconds || 0) - 1;
        let newMins = prev.minutes || 0;
        let newHours = prev.hours || 0;
        let newDays = prev.days || 0;

        if (newSecs < 0) {
          newSecs = 59;
          newMins--;
        }
        if (newMins < 0) {
          newMins = 59;
          newHours--;
        }
        if (newHours < 0) {
          newHours = 23;
          newDays--;
        }

        return { days: newDays, hours: newHours, minutes: newMins, seconds: newSecs };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (d, h, m, s) => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const handleConnectGmail = async () => {
    const success = await connectGmail();
    if (success) {
      setGmailConnected(true);
    }
  };
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
            <button className="border-2 border-black px-4 py-2 text-sm font-bold hover:bg-black hover:text-white transition flex items-center gap-2">
              🔄 ONE-CLICK RESCHEDULE
            </button>
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

        {/* Chat/Query Section */}
        <QuerySection />
      </div>
    </div>
  </div>

);
}
