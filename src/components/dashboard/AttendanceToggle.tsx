'use client';

// =============================================
// Attendance Toggle — The Hero Interaction
// =============================================

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import type { StudentWithDetails, AttendanceStatus } from '@/types';

interface AttendanceToggleProps {
  student: StudentWithDetails;
  isBeforeCutoff: boolean;
  onUpdate: (studentId: string, status: AttendanceStatus) => Promise<boolean>;
}

export default function AttendanceToggle({
  student,
  isBeforeCutoff,
  onUpdate,
}: AttendanceToggleProps) {
  const [updating, setUpdating] = useState(false);
  const toast = useToast();
  const currentStatus = student.attendance?.status || 'pending';
  const isLocked = student.attendance?.locked || !isBeforeCutoff;

  const handleToggle = async (status: 'coming' | 'not_coming') => {
    if (isLocked || updating || currentStatus === status) return;

    setUpdating(true);
    const success = await onUpdate(student.id, status);

    if (success) {
      toast.success(
        status === 'coming'
          ? `${student.name} is marked as coming!`
          : `${student.name} is marked as not coming`
      );
    } else {
      toast.error('Failed to update attendance. Please try again.');
    }

    setUpdating(false);
  };

  return (
    <div className="attendance-toggle-container" id="attendance-toggle">
      <h3 className="attendance-toggle-title">
        Will {student.name.split(' ')[0]} take the bus today?
      </h3>

      {isLocked && (
        <div className="attendance-locked-notice">
          <span>🔒</span>
          <span>Attendance is locked after cutoff time</span>
        </div>
      )}

      <div className="attendance-toggle-buttons">
        <button
          className={cn(
            'attendance-btn attendance-btn-coming',
            currentStatus === 'coming' && 'attendance-btn-active',
            isLocked && 'attendance-btn-disabled'
          )}
          onClick={() => handleToggle('coming')}
          disabled={isLocked || updating}
          id="btn-coming"
        >
          <span className="attendance-btn-icon">✓</span>
          <span className="attendance-btn-label">Yes, Coming</span>
          {currentStatus === 'coming' && (
            <span className="attendance-btn-check">●</span>
          )}
        </button>

        <button
          className={cn(
            'attendance-btn attendance-btn-not-coming',
            currentStatus === 'not_coming' && 'attendance-btn-active',
            isLocked && 'attendance-btn-disabled'
          )}
          onClick={() => handleToggle('not_coming')}
          disabled={isLocked || updating}
          id="btn-not-coming"
        >
          <span className="attendance-btn-icon">✗</span>
          <span className="attendance-btn-label">Not Today</span>
          {currentStatus === 'not_coming' && (
            <span className="attendance-btn-check">●</span>
          )}
        </button>
      </div>

      {currentStatus === 'pending' && !isLocked && (
        <p className="attendance-hint">
          ⏳ Please confirm your attendance before cutoff
        </p>
      )}
    </div>
  );
}
