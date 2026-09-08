export default function StatusCards() {
  return (
    <div className="grid grid-cols-3 gap-6 mb-12">
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-2 tracking-wider">
          SYSTEM EFFICIENCY
        </p>
        <p className="text-3xl font-bold mb-2 text-primary-600 dark:text-primary-400">8.4 HRS</p>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Time saved through automated triage and agent delegation this week.
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-4">
          ↑ +1.2 hrs vs last week
        </p>
      </div>

      <div className="border-2 border-primary-500 rounded-2xl p-6 bg-gradient-to-br from-primary-600 to-primary-900 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-1">
        <p className="text-xs text-gray-400 font-mono mb-2">
          THROUGHPUT
        </p>
        <p className="text-3xl font-bold mb-2">
          142 / 148
        </p>
        <p className="text-sm">
          Tasks completed vs. identified.
        </p>

        <div className="mt-4 text-xs font-semibold bg-white/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
          <p className="text-white">
            RESOLUTION RATE: 96.0%
          </p>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-4 tracking-wider">
          HIGH-VOLUME SOURCES
        </p>

        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
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