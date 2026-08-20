'use client';

// =============================================
// Today's Bus Card — Live Bus & ETA Monitor
// =============================================

import Card, { CardBody } from '@/components/ui/Card';
import { formatTime } from '@/lib/utils';
import type { StudentWithDetails } from '@/types';

interface TodayBusCardProps {
  student: StudentWithDetails;
}

export default function TodayBusCard({ student }: TodayBusCardProps) {
  return (
    <Card className="today-bus-card" id="today-bus-card">
      <CardBody>
        <div className="bus-card-header-row mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="live-radar-dot" />
            <span className="text-xs font-bold uppercase tracking-wider text-green-400">
              Morning Bus Run Active
            </span>
          </div>
          <span className="text-xs font-medium text-secondary bg-surface px-2.5 py-1 rounded-full border border-subtle">
            Scheduled Daily Route
          </span>
        </div>

        <div className="bus-card-grid">
          {/* Bus Info */}
          <div className="bus-card-item">
            <span className="bus-card-icon">🚌</span>
            <div>
              <span className="bus-card-label">Assigned Bus</span>
              <span className="bus-card-value font-bold text-primary">
                {student.bus?.bus_number || 'BUS-01'}
              </span>
            </div>
          </div>

          {/* Route */}
          <div className="bus-card-item">
            <span className="bus-card-icon">🗺️</span>
            <div>
              <span className="bus-card-label">Route Line</span>
              <span className="bus-card-value">
                {student.route?.name || 'North Express Line'}
              </span>
            </div>
          </div>

          {/* Stop */}
          <div className="bus-card-item">
            <span className="bus-card-icon">📍</span>
            <div>
              <span className="bus-card-label">Your Stop</span>
              <span className="bus-card-value font-semibold">
                {student.stop?.name || 'Civil Lines Gate'}
              </span>
            </div>
          </div>

          {/* Expected Time */}
          <div className="bus-card-item">
            <span className="bus-card-icon">⏰</span>
            <div>
              <span className="bus-card-label">Estimated Pickup</span>
              <span className="bus-card-value text-green-400 font-bold">
                {student.stop?.expected_time
                  ? formatTime(student.stop.expected_time)
                  : '06:30 AM'}
              </span>
            </div>
          </div>
        </div>

        {/* Driver Quick Badge */}
        <div className="driver-quick-contact mt-4 pt-3 border-t border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30">
              SK
            </div>
            <div>
              <div className="text-xs font-semibold text-primary">Suresh Kumar</div>
              <div className="text-[11px] text-secondary">Assigned School Driver</div>
            </div>
          </div>

          <a
            href="tel:+919876543210"
            className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 transition-all hover:bg-purple-500/20"
          >
            <span>📞</span> Call Driver
          </a>
        </div>
      </CardBody>
    </Card>
  );
}
