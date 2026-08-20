'use client';

// =============================================
// Route Summary — Stats bar for driver
// =============================================

import StatCard from '@/components/ui/StatCard';
import type { RouteSummaryData } from '@/types';

interface RouteSummaryProps {
  summary: RouteSummaryData;
}

export default function RouteSummary({ summary }: RouteSummaryProps) {
  return (
    <div className="route-summary grid grid-4 gap-4 mb-6" id="route-summary">
      <StatCard
        label="Coming"
        value={summary.coming}
        accent="green"
        icon={<span>✓</span>}
      />
      <StatCard
        label="Not Coming"
        value={summary.not_coming}
        accent="red"
        icon={<span>✗</span>}
      />
      <StatCard
        label="No Response"
        value={summary.no_response + summary.pending}
        accent="amber"
        icon={<span>?</span>}
      />
      <StatCard
        label="Picked Up"
        value={summary.picked_up}
        accent="blue"
        icon={<span>🚌</span>}
      />
    </div>
  );
}
