'use client';

// =============================================
// Route Progress Bar
// =============================================

import type { RouteSummaryData } from '@/types';

interface RouteProgressProps {
  summary: RouteSummaryData;
}

export default function RouteProgress({ summary }: RouteProgressProps) {
  const total = summary.total_students || 1;
  const pickedUpPct = (summary.picked_up / total) * 100;
  const comingPct = (summary.coming / total) * 100;
  const notComingPct = (summary.not_coming / total) * 100;

  return (
    <div className="route-progress mb-6" id="route-progress">
      <div className="route-progress-header">
        <span className="text-sm font-medium">Route Progress</span>
        <span className="text-sm text-secondary">
          {summary.picked_up} / {summary.coming} picked up
        </span>
      </div>
      <div className="route-progress-bar">
        <div
          className="route-progress-fill route-progress-picked"
          style={{ width: `${pickedUpPct}%` }}
        />
        <div
          className="route-progress-fill route-progress-coming"
          style={{ width: `${comingPct - pickedUpPct}%` }}
        />
        <div
          className="route-progress-fill route-progress-absent"
          style={{ width: `${notComingPct}%` }}
        />
      </div>
      <div className="route-progress-legend">
        <span className="legend-item">
          <span className="legend-dot legend-picked" /> Picked Up
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-coming" /> Coming
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-absent" /> Absent
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-pending" /> Pending
        </span>
      </div>
    </div>
  );
}

export { RouteProgress };
