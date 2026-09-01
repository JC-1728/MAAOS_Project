import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast container floating at the top right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          // Compute style based on type
          let borderClass = 'border-ink/20';
          let bgClass = 'bg-paper';
          let textClass = 'text-ink';
          let icon = 'ℹ';

          if (toast.type === 'success') {
            borderClass = 'border-green-600';
            bgClass = 'bg-green-50';
            textClass = 'text-green-800';
            icon = '✓';
          } else if (toast.type === 'error') {
            borderClass = 'border-red-600';
            bgClass = 'bg-red-50';
            textClass = 'text-red-800';
            icon = '⚠';
          } else if (toast.type === 'warning') {
            borderClass = 'border-amber-600';
            bgClass = 'bg-amber-50';
            textClass = 'text-amber-800';
            icon = '⚠';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border-2 ${borderClass} ${bgClass} ${textClass} p-4 font-mono text-xs shadow-md flex items-start justify-between gap-3 animate-slide-in`}
              style={{
                animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              <div className="flex gap-2">
                <span className="font-bold select-none">{icon}</span>
                <div className="flex-1 break-words">
                  <span className="font-bold uppercase tracking-wider block text-[10px] opacity-60 mb-0.5">
                    {toast.type}
                  </span>
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-50 hover:opacity-100 font-bold transition-opacity ml-2 text-sm leading-none"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Insert styles inline for the slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
