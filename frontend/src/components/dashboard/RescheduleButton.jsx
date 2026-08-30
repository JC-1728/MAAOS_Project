import React, { useState } from 'react';
import { RotateCcw, Check, X, Loader2 } from 'lucide-react';

// IMPORTANT: adjust this relative path to match where YOUR file actually
// lives relative to src/services/schedulingService.js. Count folder levels:
//   src/components/dashboard/RescheduleButton.jsx  -> '../../services/schedulingService'
//   src/components/RescheduleButton.jsx             -> '../services/schedulingService'
//   src/pages/RescheduleButton.jsx                   -> '../services/schedulingService'
import { getSuggestedSlots, applySuggestedSlot } from '../../services/schedulingService';

/**
 * One-Click Reschedule button.
 * REQUIRES a taskId prop — it will not work as <RescheduleButton /> alone.
 *
 * Usage (inside TaskCard.jsx or wherever a single task is rendered):
 *   <RescheduleButton
 *     taskId={task.task_id}
 *     onRescheduled={(newDeadline) => {
 *       // update local state / refetch tasks so countdown + timetable reflect the change
 *     }}
 *   />
 */
export default function RescheduleButton({ taskId, onRescheduled }) {
  const [status, setStatus] = useState('idle'); // idle | loading | suggestions | applying | success | error
  const [suggestions, setSuggestions] = useState([]);
  const [conflictsWith, setConflictsWith] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Guard clause: fail loudly and clearly instead of a silent broken click.
  if (!taskId) {
    return (
      <button
        disabled
        title="No task selected — this button needs a taskId prop"
        className="border-2 border-gray-300 text-gray-400 px-4 py-2 text-sm font-bold flex items-center gap-2 cursor-not-allowed"
      >
        <RotateCcw size={16} /> RESCHEDULE (no task)
      </button>
    );
  }

  const handleReschedule = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await getSuggestedSlots(taskId);

      if (!result.has_conflict) {
        setStatus('idle');
        setErrorMessage('No conflict detected for this task.');
        return;
      }

      setSuggestions(result.suggestions);
      setConflictsWith(result.conflicts_with);
      setStatus('suggestions');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Could not fetch suggestions.');
    }
  };

  const handleApply = async (slot) => {
    setStatus('applying');

    try {
      const result = await applySuggestedSlot(taskId, slot.start, slot.end);
      setStatus('success');
      if (onRescheduled) onRescheduled(result.new_deadline);

      setTimeout(() => {
        setStatus('idle');
        setSuggestions([]);
        setConflictsWith([]);
      }, 2000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Could not apply this slot.');
    }
  };

  const handleCancel = () => {
    setStatus('idle');
    setSuggestions([]);
    setConflictsWith([]);
    setErrorMessage('');
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleReschedule}
        disabled={status === 'loading' || status === 'applying'}
        className="border-2 border-black px-4 py-2 text-sm font-bold hover:bg-black hover:text-white transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" /> CHECKING...
          </>
        ) : (
          <>
            <RotateCcw size={16} /> ONE-CLICK RESCHEDULE
          </>
        )}
      </button>

      {errorMessage && status !== 'suggestions' && (
        <p className="text-xs text-gray-500 mt-2">{errorMessage}</p>
      )}

      {status === 'suggestions' && (
        <div className="absolute z-10 mt-2 w-96 bg-white border-2 border-black rounded shadow-lg p-4 right-0 reschedule-suggestions-popover">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-mono text-gray-500">CONFLICT DETECTED</p>
              <p className="text-sm font-bold">
                Overlaps with {conflictsWith.map((c) => c.title).join(', ')}
              </p>
            </div>
            <button onClick={handleCancel} className="text-gray-400 hover:text-black">
              <X size={18} />
            </button>
          </div>

          {suggestions.length === 0 ? (
            <p className="text-sm text-gray-600">No open slots found in the next 7 days.</p>
          ) : (
            <div className="space-y-2">
              {suggestions.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApply(slot)}
                  disabled={status === 'applying'}
                  className="w-full text-left border border-gray-300 rounded p-3 hover:border-black hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">
                        {new Date(slot.start).toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(slot.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {' - '}
                        {new Date(slot.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    {idx === 0 && (
                      <span className="text-xs bg-black text-white px-2 py-1 rounded font-bold">BEST</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{slot.reason}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {status === 'success' && (
        <div className="absolute z-10 mt-2 right-0 bg-black text-white text-sm px-4 py-2 rounded flex items-center gap-2">
          <Check size={16} /> Task rescheduled
        </div>
      )}
    </div>
  );
}