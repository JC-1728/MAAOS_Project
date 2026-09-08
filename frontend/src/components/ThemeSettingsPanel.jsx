import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Settings, Moon, Sun, Monitor, X } from 'lucide-react';

const colors = [
  { id: 'blue', label: 'Blue', colorClass: 'bg-blue-500' },
  { id: 'rose', label: 'Rose', colorClass: 'bg-rose-500' },
  { id: 'emerald', label: 'Emerald', colorClass: 'bg-emerald-500' },
  { id: 'violet', label: 'Violet', colorClass: 'bg-violet-500' },
  { id: 'amber', label: 'Amber', colorClass: 'bg-amber-500' },
  { id: 'slate', label: 'Slate', colorClass: 'bg-slate-500' },
];

export default function ThemeSettingsPanel() {
  const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary-600 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 transition-transform duration-300 flex items-center justify-center animate-bounce-slow"
      >
        <Settings className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
      </button>

      {/* Slide Out Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          <div className="relative w-80 max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto font-sans text-slate-900 dark:text-slate-100 flex flex-col gap-8 transform transition-transform duration-300">
            
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Appearance</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Mode</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                >
                  <Sun className="w-5 h-5" />
                  <span className="text-xs font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-xs font-medium">Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-xs font-medium">System</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Accent Color</h3>
              <div className="grid grid-cols-3 gap-3">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setPrimaryColor(c.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${primaryColor === c.id ? 'border-primary-500 bg-slate-50 dark:bg-slate-800' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full ${c.colorClass}`} />
                    <span className="text-sm font-medium">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
