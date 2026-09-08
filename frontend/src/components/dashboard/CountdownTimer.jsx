import { useState, useEffect } from 'react';

export default function CountdownTimer({ deadline }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    if (!deadline) return;

    const tick = () => {
      const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      setTime(d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className="font-mono text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg border border-red-200 dark:border-red-800 animate-pulse">
      ⏱ {time || '--:--:--'}
    </div>
  );
}
