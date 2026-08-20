'use client';

// =============================================
// Cutoff Timer Component
// =============================================

import { useState, useEffect } from 'react';
import { getMinutesUntil, formatTimeRemaining, formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CutoffTimerProps {
  cutoffTime: string; // HH:MM
}

export default function CutoffTimer({ cutoffTime }: CutoffTimerProps) {
  const [minutesLeft, setMinutesLeft] = useState(() =>
    getMinutesUntil(cutoffTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesLeft(getMinutesUntil(cutoffTime));
    }, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [cutoffTime]);

  const isExpired = minutesLeft <= 0;
  const isUrgent = minutesLeft > 0 && minutesLeft <= 15;
  const isWarning = minutesLeft > 15 && minutesLeft <= 30;

  return (
    <div
      className={cn(
        'cutoff-timer',
        isExpired && 'cutoff-expired',
        isUrgent && 'cutoff-urgent',
        isWarning && 'cutoff-warning'
      )}
      id="cutoff-timer"
    >
      {isExpired ? (
        <>
          <span className="cutoff-icon">🔒</span>
          <span className="cutoff-label">Cutoff passed</span>
        </>
      ) : (
        <>
          <span className="cutoff-icon">⏰</span>
          <div className="cutoff-info">
            <span className="cutoff-remaining">
              {formatTimeRemaining(minutesLeft)}
            </span>
            <span className="cutoff-label">
              until {formatTime(cutoffTime)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
