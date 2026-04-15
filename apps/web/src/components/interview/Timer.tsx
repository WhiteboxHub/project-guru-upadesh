'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
  startTime: Date;
  isRunning: boolean;
  className?: string;
}

export function Timer({ startTime, isRunning, className }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - new Date(startTime).getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Clock className="h-4 w-4" />
      <span className="font-mono text-lg font-semibold">{formatTime(elapsed)}</span>
    </div>
  );
}
