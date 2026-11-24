import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ChallengeTimerProps {
  endDate: string;
  onExpire?: () => void;
  compact?: boolean;
}

export const ChallengeTimer: React.FC<ChallengeTimerProps> = ({
  endDate,
  onExpire,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1 font-mono">
        <AlertTriangle className="w-3 h-3" />
        Expired
      </span>
    );
  }

  if (compact) {
    return (
      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
        <Clock className="w-3 h-3 text-slate-500" />
        {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-amber-300">
      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span>
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-slate-400 uppercase">remaining</span>
    </div>
  );
};

export default ChallengeTimer;
