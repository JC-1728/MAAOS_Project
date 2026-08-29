export default function Navbar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6">
      <div className="mb-8">
        <div className="text-xs text-gray-500 font-mono mb-2">
          ACTIVE SESSION
        </div>
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
          <a href="#docs" className="block text-gray-600 hover:text-black">
            📖 DOCUMENTATION
          </a>

          <a href="#github" className="block text-gray-600 hover:text-black">
            💻 GITHUB
          </a>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-500 border-t border-gray-200 pt-4">
        © 2024 ACADEMIC OS KERNEL
      </div>
    </div>
  );
}