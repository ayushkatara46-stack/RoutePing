'use client';

// =============================================
// RouteVisualizer & Live Simulator Component
// Clean & Sleek Route Timeline & Stop Triage
// =============================================

import { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export interface VisualStop {
  id: string;
  name: string;
  stop_number: number;
  expected_time: string;
  address?: string;
  students: Array<{
    id: string;
    name: string;
    status: 'coming' | 'not_coming' | 'pending' | 'no_response';
  }>;
}

interface RouteVisualizerProps {
  routeName?: string;
  busNumber?: string;
  stops?: VisualStop[];
  className?: string;
}

const DEMO_STOPS: VisualStop[] = [
  {
    id: 's1',
    name: 'Civil Lines Gate',
    stop_number: 1,
    expected_time: '06:30 AM',
    address: 'Main Entrance, Civil Lines',
    students: [
      { id: 'st1', name: 'Aarav Sharma', status: 'coming' },
      { id: 'st2', name: 'Kavya Singh', status: 'coming' },
    ],
  },
  {
    id: 's2',
    name: 'Sadar Bazaar Crossing',
    stop_number: 2,
    expected_time: '06:42 AM',
    address: 'Near Clock Tower',
    students: [
      { id: 'st3', name: 'Priya Sharma', status: 'not_coming' },
    ],
  },
  {
    id: 's3',
    name: 'Railway Colony',
    stop_number: 3,
    expected_time: '06:55 AM',
    address: 'Block B, Quarters',
    students: [
      { id: 'st4', name: 'Rohan Verma', status: 'coming' },
      { id: 'st5', name: 'Sneha Gupta', status: 'pending' },
    ],
  },
  {
    id: 's4',
    name: 'DPS School Main Gate',
    stop_number: 4,
    expected_time: '07:15 AM',
    address: 'Final Destination Campus',
    students: [],
  },
];

export default function RouteVisualizer({
  routeName = 'Route A — North Zone Express',
  busNumber = 'BUS-01',
  stops = DEMO_STOPS,
  className = '',
}: RouteVisualizerProps) {
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedStop, setSelectedStop] = useState<VisualStop | null>(stops[0] || null);
  const [savedTimeMinutes, setSavedTimeMinutes] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([
    'Route initialized &bull; 3 pickup stops scheduled',
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStopIndex((prev) => {
          if (prev >= stops.length - 1) {
            setIsPlaying(false);
            setLogs((l) => [
              `🏁 Route Completed — All students arrived at campus safely.`,
              ...l.slice(0, 3),
            ]);
            return prev;
          }
          const nextIndex = prev + 1;
          const nextStop = stops[nextIndex];
          setSelectedStop(nextStop);

          const allAbsent =
            nextStop.students.length > 0 &&
            nextStop.students.every((s) => s.status === 'not_coming');

          if (allAbsent) {
            setSavedTimeMinutes((m) => m + 5);
            setLogs((l) => [
              `⚡ Stop Skipped: "${nextStop.name}" (All students marked absent) &bull; +5 mins saved`,
              ...l.slice(0, 3),
            ]);
          } else if (nextIndex === stops.length - 1) {
            setLogs((l) => [
              `🏫 Arrived at Final Stop: ${nextStop.name}`,
              ...l.slice(0, 3),
            ]);
          } else {
            setLogs((l) => [
              `🚌 Arrived at Stop ${nextIndex + 1}: ${nextStop.name}`,
              ...l.slice(0, 3),
            ]);
          }

          return nextIndex;
        });
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, stops]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStopIndex(0);
    setSelectedStop(stops[0] || null);
    setSavedTimeMinutes(0);
    setLogs(['Route ready &bull; Standing by for morning run.']);
  };

  const handleNextStep = () => {
    if (currentStopIndex < stops.length - 1) {
      const nextIdx = currentStopIndex + 1;
      setCurrentStopIndex(nextIdx);
      setSelectedStop(stops[nextIdx]);
    }
  };

  return (
    <div className={`route-card-clean ${className}`} id="route-visualizer">
      {/* Header */}
      <div className="route-header-clean">
        <div className="route-title-clean">
          <div className="route-pill-live">
            <span className="live-radar-dot" />
            LIVE ROUTE
          </div>
          <h3 className="text-base font-bold text-primary flex items-center gap-2">
            <span>🚌</span> {busNumber} &bull; {routeName}
          </h3>
        </div>

        <div className="route-actions-clean">
          {savedTimeMinutes > 0 && (
            <div className="saved-pill-clean">
              <span>⚡ Saved: <strong>{savedTimeMinutes} mins</strong></span>
            </div>
          )}

          <Button
            size="sm"
            variant={isPlaying ? 'danger' : 'primary'}
            onClick={() => setIsPlaying(!isPlaying)}
            id="sim-play-toggle"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play Sim'}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleNextStep}
            disabled={currentStopIndex >= stops.length - 1 || isPlaying}
          >
            ⏭ Next
          </Button>

          <Button size="sm" variant="secondary" onClick={handleReset}>
            🔄 Reset
          </Button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="route-timeline-clean">
        {/* Track Bar (Centered with nodes) */}
        <div className="timeline-track-bar">
          <div
            className="timeline-track-fill"
            style={{
              width: `${(currentStopIndex / (stops.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Nodes Grid */}
        <div className="timeline-nodes-row">
          {stops.map((stop, idx) => {
            const isCurrent = idx === currentStopIndex;
            const isPassed = idx < currentStopIndex;
            const allAbsent =
              stop.students.length > 0 &&
              stop.students.every((s) => s.status === 'not_coming');
            const isSelected = selectedStop?.id === stop.id;

            let nodeStateClass = 'node-upcoming';
            let badgeText = `${stop.students.filter((s) => s.status === 'coming').length} Coming`;
            let badgeVariant: 'green' | 'red' | 'amber' | 'blue' = 'green';

            if (isCurrent) {
              nodeStateClass = 'node-active';
            } else if (isPassed) {
              nodeStateClass = 'node-completed';
            }

            if (allAbsent) {
              badgeText = 'Skip (Absent)';
              badgeVariant = 'red';
              if (!isPassed && !isCurrent) nodeStateClass = 'node-skipped';
            } else if (idx === stops.length - 1) {
              badgeText = 'Campus';
              badgeVariant = 'blue';
            }

            return (
              <div
                key={stop.id}
                className={`timeline-stop-col ${isSelected ? 'timeline-stop-selected' : ''}`}
                onClick={() => setSelectedStop(stop)}
              >
                {/* Circle Node */}
                <div className={`timeline-circle-node ${nodeStateClass}`}>
                  {isCurrent ? (
                    <span className="text-base">🚌</span>
                  ) : isPassed ? (
                    '✓'
                  ) : allAbsent ? (
                    '✕'
                  ) : (
                    stop.stop_number
                  )}
                </div>

                {/* Stop Label info below */}
                <div className="timeline-stop-details">
                  <div className="timeline-stop-title">{stop.name}</div>
                  <div className="timeline-stop-time">{stop.expected_time}</div>
                  <div className="mt-1.5">
                    <Badge variant={badgeVariant} size="sm">
                      {badgeText}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Footer */}
      <div className="route-footer-clean">
        {selectedStop && (
          <div className="footer-stop-info">
            <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Stop Details &bull; #{selectedStop.stop_number}
            </div>
            <div className="text-sm font-bold text-primary mb-1">
              {selectedStop.name} <span className="text-xs text-secondary font-normal">({selectedStop.address})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedStop.students.length === 0 ? (
                <span className="text-xs text-secondary">Final Drop-off Destination</span>
              ) : (
                selectedStop.students.map((st) => (
                  <span
                    key={st.id}
                    className={`student-chip-clean student-chip-${st.status}`}
                  >
                    {st.status === 'coming' ? '✓' : st.status === 'not_coming' ? '✕' : '⏳'}{' '}
                    {st.name}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        <div className="footer-logs-clean">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="live-radar-dot" /> Live Route Events
          </div>
          <div className="space-y-1">
            {logs.slice(0, 2).map((log, i) => (
              <div key={i} className="text-xs text-secondary bg-black/20 px-2.5 py-1 rounded border border-white/5">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
