import { useEffect, useState, useRef } from "react";

interface TimerProps {
  isActive: boolean;
  isPaused?: boolean;
  onTimeUpdate?: (time: number) => void;
}

export const Timer = ({
  isActive,
  isPaused = false,
  onTimeUpdate,
}: TimerProps) => {
  const [time, setTime] = useState(0);
  const callbackRef = useRef(onTimeUpdate);

  useEffect(() => {
    callbackRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  useEffect(() => {
    callbackRef.current?.(time);
  }, [time]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  const formatTime = (h: number, m: number, s: number) => {
    const parts = [];
    if (h > 0) parts.push(String(h).padStart(2, "0"));
    parts.push(String(m).padStart(2, "0"));
    parts.push(String(s).padStart(2, "0"));
    return parts.join(":");
  };

  return (
    <div
      className={`flex items-center gap-1 sm:gap-2 text-sm sm:text-base lg:text-lg font-semibold ${isPaused ? "text-orange-600" : "text-slate-700"}`}
    >
      <svg
        className={`w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 ${isPaused ? "opacity-50" : ""}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-2.828 2.829a1 1 0 101.415 1.415L9 11.414V6z"
          clipRule="evenodd"
        />
      </svg>
      <span className="whitespace-nowrap">
        {formatTime(hours, minutes, seconds)}
      </span>
      {isPaused && (
        <span className="text-xs sm:text-sm ml-1 text-orange-600">
          (Paused)
        </span>
      )}
    </div>
  );
};
