import React, { createContext, useContext, useState, useEffect } from 'react';

const LatencyContext = createContext();

export function LatencyProvider({ children }) {
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    function pingHealth() {
      const start = performance.now();
      fetch('/api/health')
        .then(res => {
          if (res.ok) {
            const lat = Math.round(performance.now() - start);
            setLatency(lat);
          } else {
            setLatency(null);
          }
        })
        .catch(() => setLatency(null));
    }

    pingHealth();
    const interval = setInterval(pingHealth, 15000);

    function handleLatency(e) {
      if (e.detail && typeof e.detail.latency === 'number') {
        setLatency(e.detail.latency);
      } else {
        setLatency(null);
      }
    }

    window.addEventListener('maaos-latency', handleLatency);
    return () => {
      clearInterval(interval);
      window.removeEventListener('maaos-latency', handleLatency);
    };
  }, []);

  // Determine latency status level
  let latencyStatus = 'unknown';
  if (latency !== null) {
    if (latency < 300) latencyStatus = 'green';
    else if (latency <= 800) latencyStatus = 'yellow';
    else latencyStatus = 'red';
  }

  return (
    <LatencyContext.Provider value={{ latency, latencyStatus }}>
      {children}
    </LatencyContext.Provider>
  );
}

export function useLatency() {
  return useContext(LatencyContext);
}

