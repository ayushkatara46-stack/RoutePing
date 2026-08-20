'use client';

// =============================================
// Today's Bus Card — Shows bus/stop/time info
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
        <div className="bus-card-grid">
          {/* Bus Info */}
          <div className="bus-card-item">
            <span className="bus-card-icon">🚌</span>
            <div>
              <span className="bus-card-label">Bus</span>
              <span className="bus-card-value">
                {student.bus?.bus_number || 'Not assigned'}
              </span>
            </div>
          </div>

          {/* Route */}
          <div className="bus-card-item">
            <span className="bus-card-icon">🗺️</span>
            <div>
              <span className="bus-card-label">Route</span>
              <span className="bus-card-value">
                {student.route?.name || 'Not assigned'}
              </span>
            </div>
          </div>

          {/* Stop */}
          <div className="bus-card-item">
            <span className="bus-card-icon">📍</span>
            <div>
              <span className="bus-card-label">Stop</span>
              <span className="bus-card-value">
                {student.stop?.name || 'Not assigned'}
              </span>
            </div>
          </div>

          {/* Expected Time */}
          <div className="bus-card-item">
            <span className="bus-card-icon">🕐</span>
            <div>
              <span className="bus-card-label">Expected</span>
              <span className="bus-card-value">
                {student.stop?.expected_time
                  ? formatTime(student.stop.expected_time)
                  : '--:--'}
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
