import { useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { rescheduleTasks } from "../../services/schedulingService";

export default function TaskCard({ task, idx }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState("");

  const handleReschedule = async () => {
    setLoading(true);
    setMessage("");
    setSuggestions([]);

    try {
      const result = await rescheduleTasks(task);

      if (result.has_conflict) {
        setSuggestions(result.suggestions || []);

        if (!result.suggestions?.length) {
          setMessage("No suitable alternative slots found.");
        }
      } else {
        setMessage("No scheduling conflict detected.");
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      setMessage("Failed to connect to the Adaptive Planner.");
    } finally {
      setLoading(false);
    }
  };

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
            <CountdownTimer deadline={task.deadline} />
          )}

        </div>
      </div>


      {/* Progress */}

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


      {/* Reschedule button */}

      {idx === 0 && (
        <button
          onClick={handleReschedule}
          disabled={loading}
          className="w-full border-2 border-black px-4 py-3 text-sm font-bold hover:bg-black hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={16} />

          {loading
            ? "ANALYZING SCHEDULE..."
            : "ONE-CLICK RESCHEDULE"}
        </button>
      )}


      {/* Backend message */}

      {message && (
        <div className="mt-3 text-xs font-mono text-gray-700 bg-gray-100 px-3 py-2 rounded">
          {message}
        </div>
      )}


      {/* Suggested slots */}

      {suggestions.length > 0 && (
        <div className="mt-4 border-2 border-gray-200 rounded p-4">

          <h4 className="text-sm font-bold font-mono mb-3">
            SUGGESTED TIME SLOTS
          </h4>

          <div className="space-y-2">

            {suggestions.map((slot, index) => (
              <div
                key={`${slot.start}-${index}`}
                className="border border-gray-300 rounded p-3 hover:border-black transition"
              >

                <div className="flex justify-between items-center">

                  <div>
                    <p className="text-sm font-bold">
                      OPTION {index + 1}
                    </p>

                    <p className="text-xs text-gray-600">
                      {new Date(slot.start).toLocaleString()}
                      {" → "}
                      {new Date(slot.end).toLocaleString()}
                    </p>
                  </div>

                  <span className="text-xs font-bold">
                    SCORE: {slot.score}
                  </span>

                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {slot.reason}
                </p>

              </div>
            ))}

          </div>

        </div>
      )}


      {/* Critical warning */}

      {idx === 0 && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-3 py-2 rounded mt-4">
          <AlertCircle size={16} />

          <span className="font-mono">
            CRITICAL: Replan immediately or mark escalation risk
          </span>

        </div>
      )}

    </div>
  );
}