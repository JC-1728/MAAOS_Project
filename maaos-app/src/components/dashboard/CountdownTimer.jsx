import { useState, useEffect } from "react";
import { calculateCountdown } from "../../utils/countdown";

export default function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState(
    calculateCountdown(deadline)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateCountdown(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.expired) {
    return (
      <div className="bg-red-100 text-red-700 px-3 py-2 rounded font-bold text-sm">
        EXPIRED
      </div>
    );
  }

  return (
    <div className="bg-red-100 text-red-700 px-3 py-2 rounded font-bold text-sm font-mono">
      {String(timeLeft.days).padStart(2, "0")}d{" "}
      {String(timeLeft.hours).padStart(2, "0")}h{" "}
      {String(timeLeft.minutes).padStart(2, "0")}m{" "}
      {String(timeLeft.seconds).padStart(2, "0")}s
    </div>
  );
}