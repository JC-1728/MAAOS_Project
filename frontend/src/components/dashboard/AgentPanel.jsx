import React, { useState, useEffect } from "react";
import { fetchAgentLogs, analyzeWorkload } from "../../services/aiService";

export default function AgentPanel() {
  const [logs, setLogs] = useState([]);
  const [workloadInfo, setWorkloadInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTelemetryData = async () => {
    setLoading(true);
    const logsRes = await fetchAgentLogs();
    if (logsRes && logsRes.logs) {
      setLogs(logsRes.logs);
    }
    const workloadRes = await analyzeWorkload();
    if (workloadRes) {
      setWorkloadInfo(workloadRes);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTelemetryData();
    const interval = setInterval(loadTelemetryData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold font-mono tracking-tight">
          🤖 TASK DELEGATION & AGENT EXECUTION LOGS
        </h2>
        <button
          onClick={loadTelemetryData}
          className="text-xs font-mono font-bold bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
        >
          {loading ? "REFRESHING..." : "↻ REFRESH TELEMETRY"}
        </button>
      </div>

      {workloadInfo && (
        <div className="mb-4 border-2 border-black rounded p-4 bg-yellow-50 font-mono text-xs flex justify-between items-center">
          <div>
            <span className="font-bold">BURNOUT RISK ASSESSMENT: </span>
            <span className={workloadInfo.burnout_risk_level?.includes("High") ? "text-red-700 font-bold" : "text-black"}>
              {workloadInfo.burnout_risk_level} (Score: {workloadInfo.workload_density_score}/100)
            </span>
          </div>
          {workloadInfo.recommendations?.length > 0 && (
            <div className="text-gray-700 text-right">
              💡 {workloadInfo.recommendations[0]}
            </div>
          )}
        </div>
      )}

      <div className="border border-gray-300 rounded p-6 bg-white font-mono text-xs max-h-60 overflow-y-auto shadow-inner">
        {logs.length === 0 ? (
          <div className="text-gray-500">Initializing background telemetry...</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={log.id || index} className="flex items-start gap-2 border-b border-gray-100 pb-1">
                <span className="text-gray-400 min-w-[70px]">[{log.timestamp?.split(" ")[1] || "LOG"}]</span>
                <span className="font-bold text-black min-w-[150px]">[{log.agent_name}]:</span>
                <span className={log.priority_flag ? "text-red-600 font-semibold flex-1" : "text-gray-800 flex-1"}>
                  {log.action} - {log.details}
                </span>
                <span className="text-green-700 font-bold text-[10px] bg-green-100 px-1 rounded">
                  {log.status || "OK"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}