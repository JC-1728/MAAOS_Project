import React, { useState } from "react";
import { sendCoordinatorChat, uploadSyllabus } from "../../services/aiService";

export default function QuerySection() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chatResult, setChatResult] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const handleExecute = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setUploadResult(null);
    const res = await sendCoordinatorChat(query);
    setChatResult(res);
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setChatResult(null);
    const res = await uploadSyllabus(file);
    setUploadResult(res);
    setUploading(false);
  };

  return (
    <div className="border-2 border-black rounded p-6 bg-white shadow-sm mb-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-gray-600 font-mono font-semibold uppercase tracking-wider">
            ⚡ ASK COORDINATOR AGENT (CONVERSATIONAL MEMORY)
          </p>
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-black text-black px-3 py-1 text-xs font-mono font-bold rounded flex items-center gap-1">
            📄 {uploading ? "Parsing PDF..." : "Upload Syllabus PDF"}
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExecute()}
            placeholder="Ask me about DBMS, workload density, deadlines, or upload your syllabus PDF..."
            className="flex-1 border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-black font-mono"
          />

          <button
            onClick={handleExecute}
            disabled={loading}
            className="bg-black text-white px-6 py-3 font-bold text-sm hover:bg-gray-900 font-mono flex items-center gap-1"
          >
            {loading ? "PROCESSING..." : "EXECUTE ▶"}
          </button>
        </div>
      </div>

      {/* Chat Response with Conversational Memory Display */}
      {chatResult && (
        <div className="mt-4 p-4 border border-black bg-gray-50 rounded font-mono text-xs">
          <div className="font-bold text-black mb-1">🤖 COORDINATOR RESPONSE:</div>
          <p className="text-gray-800 whitespace-pre-wrap mb-3">{chatResult.agent_response}</p>
          
          {chatResult.auto_added_task && (
            <div className="p-2 bg-green-50 border border-green-400 rounded text-green-800 text-xs font-mono font-semibold">
              ✔ Auto-Created Task: "{chatResult.auto_added_task.title}" ({chatResult.auto_added_task.course}) - {chatResult.auto_added_task.deadline}
            </div>
          )}

          {chatResult.conversation_history && chatResult.conversation_history.length > 1 && (
            <div className="mt-3 border-t border-gray-300 pt-2">
              <span className="text-gray-500 font-semibold">Memory Context ({chatResult.conversation_history.length} turns recorded)</span>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Syllabus Result */}
      {uploadResult && (
        <div className="mt-4 p-4 border border-blue-600 bg-blue-50 rounded font-mono text-xs text-blue-900">
          <div className="font-bold mb-1">✅ SYLLABUS PIPELINE PROCESSED: {uploadResult.filename}</div>
          <p className="mb-2">{uploadResult.message}</p>
          <div className="font-bold mb-1">Extracted Course Tasks ({uploadResult.extracted_tasks_count}):</div>
          <ul className="list-disc pl-5">
            {uploadResult.tasks?.map((t, idx) => (
              <li key={idx}>
                <span className="font-bold">{t.title}</span> [{t.course}] - Due: {t.deadline} ({t.priority})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}