import React, { useState, useEffect } from 'react'
import { useLatency } from './LatencyContext.jsx'

/** Shared top status strip + footer used on the auth screens, matching the MAAOS kernel UI. */
export function TopStrip({ protocolLabel, reqId }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
      setToastMessage('Back online');
      setToastType('online');
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 3000);
    }
    
    function handleOffline() {
      setIsOffline(true);
      setToastMessage('Offline — some features may be unavailable');
      setToastType('offline');
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 5000);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="w-full flex flex-col font-mono text-[11px] tracking-wide text-ink/60">
      <div className="w-full flex items-center justify-between px-4 py-2 border-b border-ink/5 bg-paper">
        <span className="flex items-center gap-1">
          <span aria-hidden>🔒</span> {protocolLabel || 'SECURE SYSTEM_LINK'}
          {isOffline && (
            <span className="ml-2 px-1.5 py-0.5 border border-red-600 text-red-700 bg-red-50 text-[9px] font-bold">
              [ OFFLINE ]
            </span>
          )}
        </span>
        <span>{reqId || 'SESSION_ID: 0x000000'}</span>
      </div>

      {/* Floating status ribbon */}
      {showStatusToast && (
        <div 
          className={`w-full text-center py-2 px-4 border-b font-semibold select-none z-10 transition-all duration-300 ${
            toastType === 'online'
              ? 'bg-green-50 text-green-700 border-green-300'
              : 'bg-red-50 text-red-700 border-red-300'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  )
}

export function Footer({ build = 'BUILD.STABLE.V1.0.4' }) {
  const { latency, latencyStatus } = useLatency();
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const stamp = time.toISOString().substring(11, 19)

  // Color mapping for latency status
  let latencyColor = 'text-ink/60';
  let badgeBorder = 'border-ink/20';
  if (latencyStatus === 'green') {
    latencyColor = 'text-green-700';
    badgeBorder = 'border-green-600/35 bg-green-50/50';
  } else if (latencyStatus === 'yellow') {
    latencyColor = 'text-amber-700';
    badgeBorder = 'border-amber-600/35 bg-amber-50/50';
  } else if (latencyStatus === 'red') {
    latencyColor = 'text-red-700';
    badgeBorder = 'border-red-600/35 bg-red-50/50';
  }

  const latencyLabel = latency !== null ? `${latency} ms` : 'unavailable';

  return (
    <footer className="w-full border-t border-ink/10 bg-paper">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 text-[11px] font-mono text-ink/60">
        <span>ACADEMIC OS</span>
        <div className="hidden sm:flex items-center gap-6">
          <span className="hover:text-ink transition-colors cursor-pointer">SECURITY PROTOCOL</span>
          <span className="hover:text-ink transition-colors cursor-pointer">PRIVACY POLICY</span>
          <span className={`px-2 py-0.5 border ${badgeBorder} transition-colors cursor-default`}>
            API: <span className={`font-bold ${latencyColor}`}>{latencyLabel}</span>
          </span>
        </div>
        <span>[ {stamp} ]</span>
      </div>
    </footer>
  )
}

export function StatusBadge({ children }) {
  return (
    <span className="inline-block border border-ink/20 bg-ink text-paper text-[10px] font-mono px-2 py-0.5 tracking-wider">
      {children}
    </span>
  )
}
