import { useEffect, useState } from "react";

function getTimeLeft(endDate) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

/** Ticks every second until `endDate` passes, then reports `expired: true`. */
export function useCountdown(endDate) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return timeLeft;
}
