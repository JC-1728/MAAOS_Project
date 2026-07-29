import React, { useState, useEffect } from 'react';
import { RotateCcw, Zap, Clock, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Neural Nav. Conf. Paper',
      category: 'CRITICAL',
      dueDate: 'Sep 29',
      deadline: { days: 0, hours: 4, minutes: 12, seconds: 33 },
      progress: 65,
      priority: 1,
      description: 'Target: Final draft submission',
      categoryColor: 'bg-red-100 text-red-800'
    },
    {
      id: 2,
      title: 'Grant Proposal: NSF-2024',
      category: 'APPROACHABLE',
      dueDate: 'Oct 2',
      deadline: { days: 2, hours: 0, minutes: 0, seconds: 0 },
      progress: 40,
      priority: 2,
      description: 'Research proposal',
      categoryColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 3,
      title: 'Quarterly Lab Review',
      category: 'DEPENDING',
      dueDate: 'Oct 15',
      deadline: { days: 13, hours: 0, minutes: 0, seconds: 0 },
      progress: 20,
      priority: 3,
      description: 'Lab work assessment',
      categoryColor: 'bg-yellow-100 text-yellow-800'
    }
  ]);

  const [countdown, setCountdown] = useState(tasks[0]?.deadline || {});

  // Countdown timer effect
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <div className="text-xs text-gray-500 font-mono mb-2">ACTIVE SESSION</div>
          <p className="text-sm font-bold mb-1">Research Unit 01</p>
          <p className="text-xs text-gray-600">SESSION: 82:21:11</p>
        </div>

        <div className="space-y-1 mb-8">
          <button className="w-full flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold rounded hover:bg-gray-900">
            📊 DASHBOARD
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            🤖 AGENT FLEET
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            🔧 SYSTEM PROTOCOL
          </button>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <button className="w-full bg-black text-white px-4 py-3 text-sm font-bold rounded hover:bg-gray-900 mb-4">
            ⚡ INITIALIZE NEW AGENT
          </button>
          <div className="space-y-2 text-xs">
            <a href="#docs" className="block text-gray-600 hover:text-black">📖 DOCUMENTATION</a>
            <a href="#github" className="block text-gray-600 hover:text-black">💻 GITHUB</a>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-500 border-t border-gray-200 pt-4">
          © 2024 ACADEMIC OS KERNEL
        </div>
      </div>

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

          {/* Priority Queue */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-mono">PRIORITY QUEUE (TOP 3)</h2>
              <button className="border-2 border-black px-4 py-2 text-sm font-bold hover:bg-black hover:text-white transition flex items-center gap-2">
                🔄 ONE-CLICK RESCHEDULE
              </button>
            </div>

            <div className="space-y-6">
              {tasks.map((task, idx) => (
                <div key={task.id} className="border-2 border-gray-300 rounded p-6 bg-white hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${task.categoryColor} mb-3`}>
                        [{task.category}]
                      </span>
                      <h3 className="text-lg font-bold mb-2">{task.title}</h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-mono mb-2">DUE: {task.dueDate}</div>
                      {idx === 0 && (
                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold font-mono">
                          {formatTime(countdown.days, countdown.hours, countdown.minutes, countdown.seconds)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono text-gray-600">TIME REMAINING</span>
                      <span className="text-xs font-bold text-gray-800">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {idx === 0 && (
                    <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-3 py-2 rounded">
                      <AlertCircle size={16} />
                      <span className="font-mono">CRITICAL: Replan immediately or mark escalation risk</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Task Delegation Agents */}
          <div className="mb-12">
            <h2 className="text-lg font-bold font-mono mb-6">TASK DELEGATION AGENTS [READ-ONLY]</h2>
            <div className="border border-gray-300 rounded p-6 bg-white font-mono text-xs">
              <div className="text-gray-700 whitespace-pre-wrap">
{`• UNIT: Rescheduling Agent v2.1
• PARSING CALENDAR: 5 slots found (Mon 10:23-13:1 via merging deadlines)
• CONFIRMED DEPENDENCIES: AI Lab + DBMS (chain critical)
• TIME BUDGET ALLOCATE: 48 hrs available (36% availability of success: 89%)
• WAITING FOR USER INPUT...
• SYSTEM: Background telemetry stable. Memory usage: 32%`}
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="border border-gray-300 rounded p-6 bg-white">
              <p className="text-xs text-gray-600 font-mono mb-2">SYSTEM EFFICIENCY</p>
              <p className="text-3xl font-bold mb-2">8.4 HRS</p>
              <p className="text-sm text-gray-700">Time saved through automated triage and agent delegation this week.</p>
              <p className="text-xs text-gray-500 mt-4">↑ +1.2 hrs vs last week</p>
            </div>

            <div className="border-2 border-black rounded p-6 bg-black text-white">
              <p className="text-xs text-gray-400 font-mono mb-2">THROUGHPUT</p>
              <p className="text-3xl font-bold mb-2">142 / 148</p>
              <p className="text-sm">Tasks completed vs. identified.</p>
              <div className="mt-4 text-xs">
                <p className="text-gray-400">RESOLUTION RATE: 96.0%</p>
              </div>
            </div>

            <div className="border border-gray-300 rounded p-6 bg-white">
              <p className="text-xs text-gray-600 font-mono mb-2">HIGH-VOLUME SOURCES</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Prof. Smith</span>
                  <span className="font-bold">58 Items</span>
                </div>
                <div className="flex justify-between">
                  <span>Registrar</span>
                  <span className="font-bold">16 Items</span>
                </div>
                <div className="flex justify-between">
                  <span>Career Center</span>
                  <span className="font-bold">8 Items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat/Query Section */}
          <div className="border-2 border-black rounded p-6 bg-white">
            <div className="mb-4">
              <p className="text-xs text-gray-600 font-mono mb-2">QUERY COORDINATOR AGENT...</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask me about your workload, deadlines, or study strategy..."
                  className="flex-1 border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-black"
                />
                <button className="bg-black text-white px-6 py-3 font-bold text-sm hover:bg-gray-900">
                  EXECUTE ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
