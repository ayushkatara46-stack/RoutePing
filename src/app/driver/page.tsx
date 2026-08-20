'use client';

// =============================================
// Driver Dashboard Page
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { PageLoader } from '@/components/ui/Spinner';
import { RouteSummary, StopCard, RouteProgress } from '@/components/driver';
import { useRealtime } from '@/hooks/useRealtime';
import { useToast } from '@/hooks/useToast';
import type { RouteWithStops, RouteSummaryData } from '@/types';

export default function DriverPage() {
  const [route, setRoute] = useState<RouteWithStops | null>(null);
  const [summary, setSummary] = useState<RouteSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchRoute = useCallback(async () => {
    try {
      const res = await fetch('/api/driver/route');
      const json = await res.json();
      if (json.success) {
        setRoute(json.data.route);
        setSummary(json.data.summary);
      } else {
        setError(json.error || 'Failed to load route');
      }
    } catch {
      setError('Failed to load route data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  // Live updates from attendance changes
  useRealtime({
    table: 'attendance',
    event: 'UPDATE',
    onPayload: () => {
      fetchRoute(); // Re-fetch on any attendance change
    },
    enabled: !!route,
  });

  const handlePickup = async (
    studentId: string,
    pickupStatus: 'picked_up' | 'skipped'
  ) => {
    try {
      const res = await fetch('/api/driver/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, pickup_status: pickupStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          pickupStatus === 'picked_up' ? 'Student picked up!' : 'Stop skipped'
        );
        fetchRoute(); // Refresh
      } else {
        toast.error('Failed to update pickup status');
      }
    } catch {
      toast.error('Failed to update pickup status');
    }
  };

  if (loading) return <PageLoader message="Loading your route..." />;

  if (error || !route) {
    return (
      <div className="empty-state" id="driver-no-route">
        <span className="empty-state-icon">🚌</span>
        <p className="empty-state-text">{error || 'No route assigned'}</p>
        <p className="text-secondary text-sm">
          Contact the administrator to assign you a bus and route
        </p>
      </div>
    );
  }

  return (
    <div className="driver-page" id="driver-dashboard">
      {/* Header */}
      <div className="driver-header">
        <div>
          <h1>Today&apos;s Route</h1>
          <p className="text-secondary">{route.name}</p>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && <RouteSummary summary={summary} />}

      {/* Progress Bar */}
      {summary && <RouteProgress summary={summary} />}

      {/* Stop List */}
      <div className="stop-list">
        {route.stops.map((stop) => (
          <StopCard
            key={stop.id}
            stop={stop}
            onPickup={handlePickup}
          />
        ))}
      </div>
    </div>
  );
}
