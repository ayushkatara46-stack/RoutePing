'use client';

// =============================================
// Attendance History Component
// =============================================

import { useState, useEffect } from 'react';
import { formatShortDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG } from '@/lib/constants';
import StatCard from '@/components/ui/StatCard';
import type { AttendanceHistoryEntry, AttendanceStats } from '@/types';

interface AttendanceHistoryProps {
  studentId: string;
}

export default function AttendanceHistory({
  studentId,
}: AttendanceHistoryProps) {
  const [history, setHistory] = useState<AttendanceHistoryEntry[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/attendance/history?student_id=${studentId}&days=30`
        );
        const json = await res.json();
        if (json.success) {
          setHistory(json.data.history || []);
          setStats(json.data.stats || null);
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [studentId]);

  if (loading) {
    return (
      <div className="history-loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-row" />
        ))}
      </div>
    );
  }

  return (
    <div className="attendance-history" id="attendance-history">
      {/* Stats */}
      {stats && (
        <div className="grid grid-4 gap-4 mb-6">
          <StatCard
            label="Total Days"
            value={stats.total_days}
            accent="blue"
            icon={<span>📅</span>}
          />
          <StatCard
            label="Present"
            value={stats.coming_days}
            accent="green"
            icon={<span>✓</span>}
          />
          <StatCard
            label="Absent"
            value={stats.absent_days}
            accent="red"
            icon={<span>✗</span>}
          />
          <StatCard
            label="Attendance"
            value={`${stats.attendance_percentage}%`}
            accent="purple"
            icon={<span>📊</span>}
          />
        </div>
      )}

      {/* History List */}
      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">No attendance history yet</p>
          </div>
        ) : (
          history.map((entry) => {
            const config = STATUS_CONFIG[entry.status];
            return (
              <div key={entry.date} className="history-item">
                <span className="history-date">
                  {formatShortDate(entry.date)}
                </span>
                <span className={cn('badge', `badge-${config.className === 'status-coming' ? 'green' : config.className === 'status-not-coming' ? 'red' : 'amber'}`)}>
                  {config.icon} {config.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
