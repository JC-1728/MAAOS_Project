import { AlertCircle } from "lucide-react";

export default function TaskCard({
  task,
  idx,
  countdown,
  formatTime,
}) {
  return (
    <div className="border-2 border-gray-300 rounded p-6 bg-white hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span
            className={`inline-block px-2 py-1 text-xs font-bold rounded ${task.categoryColor} mb-3`}
          >
            [{task.category}]
          </span>

          <h3 className="text-lg font-bold mb-2">
            {task.title}
          </h3>

          <p className="text-sm text-gray-600">
            {task.description}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500 font-mono mb-2">
            DUE: {task.dueDate}
          </div>

          {idx === 0 && (
            <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold font-mono">
              {formatTime(
                countdown.days,
                countdown.hours,
                countdown.minutes,
                countdown.seconds
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono text-gray-600">
            TIME REMAINING
          </span>

          <span className="text-xs font-bold text-gray-800">
            {task.progress}%
          </span>
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
          <span className="font-mono">
            CRITICAL: Replan immediately or mark escalation risk
          </span>
        </div>
      )}
    </div>
  );
}