export default function QuerySection() {
  return (
    <div className="border-2 border-black rounded p-6 bg-white">
      <div className="mb-4">
        <p className="text-xs text-gray-600 font-mono mb-2">
          QUERY COORDINATOR AGENT...
        </p>

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
  );
}