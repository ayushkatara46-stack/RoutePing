'use client';

// =============================================
// Stop Card — Individual stop in driver route
// =============================================

import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG, STOP_STATE_CONFIG } from '@/lib/constants';
import StopStatusBadge from './StopStatusBadge';
import Button from '@/components/ui/Button';
import type { StopWithStudents } from '@/types';

interface StopCardProps {
  stop: StopWithStudents;
  onPickup: (studentId: string, status: 'picked_up' | 'skipped') => void;
}

export default function StopCard({ stop, onPickup }: StopCardProps) {
  const stateConfig = STOP_STATE_CONFIG[stop.state];
  const isCompleted =
    stop.state === 'all_picked_up' || stop.state === 'picked_up';
  const isSkippable = stop.state === 'skip_recommended';

  return (
    <div
      className={cn(
        'stop-card',
        `stop-card-${stop.state}`,
        isCompleted && 'stop-card-completed'
      )}
      id={`stop-${stop.stop_number}`}
    >
      {/* Stop Header */}
      <div className="stop-card-header">
        <div className="stop-number-badge">
          <span className="stop-number">{stop.stop_number}</span>
        </div>
        <div className="stop-info">
          <span className="stop-name">{stop.name}</span>
          <span className="stop-time">
            {formatTime(stop.expected_time)}
          </span>
        </div>
        <StopStatusBadge state={stop.state} />
      </div>

      {/* Students at this stop */}
      <div className="stop-students">
        {stop.students.map((student) => {
          const attendanceStatus =
            student.attendance?.status || 'pending';
          const pickupStatus =
            student.attendance?.pickup_status || 'waiting';
          const statusConfig = STATUS_CONFIG[attendanceStatus];
          const isPickedUp = pickupStatus === 'picked_up';

          return (
            <div
              key={student.id}
              className={cn(
                'stop-student',
                isPickedUp && 'stop-student-done'
              )}
            >
              <div className="stop-student-info">
                <span className="stop-student-name">{student.name}</span>
                <span
                  className={cn(
                    'stop-student-status',
                    statusConfig.className
                  )}
                >
                  {statusConfig.icon} {statusConfig.label}
                </span>
              </div>

              {/* Action Buttons */}
              {attendanceStatus === 'coming' && !isPickedUp && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onPickup(student.id, 'picked_up')}
                >
                  Pick Up
                </Button>
              )}
              {isPickedUp && (
                <span className="pickup-done-badge">✓ Picked Up</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick skip for all-absent stops */}
      {isSkippable && stop.students.length > 0 && (
        <div className="stop-skip-bar">
          <span className="text-sm text-secondary">
            All students not coming — skip recommended
          </span>
        </div>
      )}
    </div>
  );
}

export { StopCard };
