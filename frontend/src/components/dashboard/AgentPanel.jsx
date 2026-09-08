import { Bot, Zap, Shield, BookOpen } from 'lucide-react';

const agents = [
  { name: 'Coordinator AI', desc: 'Routes tasks to the right agent', icon: Zap, status: 'Active', color: 'text-amber-500' },
  { name: 'Email Triage Agent', desc: 'Classifies and prioritizes emails', icon: Bot, status: 'Idle', color: 'text-blue-500' },
  { name: 'Burnout Guard', desc: 'Monitors workload and suggests breaks', icon: Shield, status: 'Monitoring', color: 'text-emerald-500' },
  { name: 'Syllabus Parser', desc: 'Extracts deadlines from PDF syllabi', icon: BookOpen, status: 'Standby', color: 'text-violet-500' },
];

export default function AgentPanel() {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
      <h2 className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300 tracking-wider mb-4">AI AGENT FLEET</h2>
      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:shadow-md hover:scale-[1.01] transition-all duration-300"
          >
            <agent.icon className={`w-5 h-5 mt-0.5 ${agent.color}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{agent.name}</p>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${agent.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {agent.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{agent.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
