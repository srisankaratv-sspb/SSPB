import { useState, useEffect } from 'react';

export const useCountdown = (targetDateString = '2026-11-15T00:00:00+05:30') => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTime(targetDateString));

  function calculateTime(targetStr) {
    const target = new Date(targetStr).getTime();
    const now = Date.now();
    const diff = target - now;

    const d = Math.ceil(diff / 86400000);
    let label = '';

    if (diff > 0) {
      label = `${d} ${d === 1 ? 'day' : 'days'} to the Yaagam`;
    } else if (diff > -86400000) {
      label = 'The Yaagam is today';
    } else {
      label = 'The Yaagam has taken place';
    }

    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
    const minutes = Math.max(0, Math.floor((diff / 1000 / 60) % 60));
    const seconds = Math.max(0, Math.floor((diff / 1000) % 60));

    return {
      diff,
      days,
      hours,
      minutes,
      seconds,
      d,
      label,
      isToday: diff <= 0 && diff > -86400000,
      isCompleted: diff <= -86400000
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTime(targetDateString));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateString]);

  return timeLeft;
};
