export default function StatusCards() {
  return (
    <div className="grid grid-cols-3 gap-6 mb-12">
      <div className="border border-gray-300 rounded p-6 bg-white">
        <p className="text-xs text-gray-600 font-mono mb-2">
          SYSTEM EFFICIENCY
        </p>
        <p className="text-3xl font-bold mb-2">8.4 HRS</p>
        <p className="text-sm text-gray-700">
          Time saved through automated triage and agent delegation this week.
        </p>
        <p className="text-xs text-gray-500 mt-4">
          ↑ +1.2 hrs vs last week
        </p>
      </div>

      <div className="border-2 border-black rounded p-6 bg-black text-white">
        <p className="text-xs text-gray-400 font-mono mb-2">
          THROUGHPUT
        </p>
        <p className="text-3xl font-bold mb-2">
          142 / 148
        </p>
        <p className="text-sm">
          Tasks completed vs. identified.
        </p>

        <div className="mt-4 text-xs">
          <p className="text-gray-400">
            RESOLUTION RATE: 96.0%
          </p>
        </div>
      </div>

      <div className="border border-gray-300 rounded p-6 bg-white">
        <p className="text-xs text-gray-600 font-mono mb-2">
          HIGH-VOLUME SOURCES
        </p>

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
  );
}