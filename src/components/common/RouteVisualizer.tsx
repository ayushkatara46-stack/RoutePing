'use client';

// =============================================
// RouteVisualizer & Live Simulator Component
// Interactive Animated Route Timeline & Run Simulation
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

// Fallback demo stops if none provided
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
    address: 'Near Old Clock Tower',
    students: [
      { id: 'st3', name: 'Priya Sharma', status: 'not_coming' },
    ],
  },
  {
    id: 's3',
    name: 'Railway Colony',
    stop_number: 3,
    expected_time: '06:55 AM',
    address: 'Block B, Railway Quarters',
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
    '🟢 Route initialized: 3 intermediate stops scheduled',
  ]);

  // Auto-step simulation loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStopIndex((prev) => {
          if (prev >= stops.length - 1) {
            setIsPlaying(false);
            setLogs((l) => [
              `🏁 ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — Route Complete! All students delivered safely to School Campus 🎉`,
              ...l,
            ]);
            return prev;
          }
          const nextIndex = prev + 1;
          const nextStop = stops[nextIndex];
          setSelectedStop(nextStop);

          // Calculate if stop was skipped or attended
          const allAbsent =
            nextStop.students.length > 0 &&
            nextStop.students.every((s) => s.status === 'not_coming');

          if (allAbsent) {
            setSavedTimeMinutes((m) => m + 5);
            setLogs((l) => [
              `⚡ SKIP EXECUTED: All students at "${nextStop.name}" are marked ABSENT. Bus saved 5 minutes!`,
              ...l,
            ]);
          } else if (nextIndex === stops.length - 1) {
            setLogs((l) => [
              `🏫 Arrived at Final Stop: ${nextStop.name}`,
              ...l,
            ]);
          } else {
            setLogs((l) => [
              `🚌 Arrived at Stop ${nextIndex + 1}: ${nextStop.name} (Picking up ${nextStop.students.filter((s) => s.status === 'coming').length} student(s))`,
              ...l,
            ]);
          }

          return nextIndex;
        });
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, stops]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStopIndex(0);
    setSelectedStop(stops[0] || null);
    setSavedTimeMinutes(0);
    setLogs(['🔄 Simulation reset. Ready to start morning route.']);
  };

  const handleNextStep = () => {
    if (currentStopIndex < stops.length - 1) {
      const nextIdx = currentStopIndex + 1;
      setCurrentStopIndex(nextIdx);
      setSelectedStop(stops[nextIdx]);
    }
  };

  return (
    <div className={`route-visualizer-card ${className}`} id="route-visualizer">
      {/* Top Banner */}
      <div className="route-viz-header">
        <div className="route-viz-title-group">
          <div className="route-live-badge">
            <span className="live-radar-dot" />
            LIVE ROUTE TRACKER
          </div>
          <h2 className="route-viz-name">
            <span>🚌</span> {busNumber} &bull; {routeName}
          </h2>
        </div>

        {/* Simulation Controls */}
        <div className="route-viz-controls">
          <div className="saved-time-badge">
            <span className="saved-time-icon">⚡</span>
            <span>Saved: <strong>{savedTimeMinutes} mins</strong></span>
          </div>

          <Button
            size="sm"
            variant={isPlaying ? 'danger' : 'primary'}
            onClick={() => setIsPlaying(!isPlaying)}
            id="sim-play-toggle"
          >
            {isPlaying ? '⏸️ Pause Sim' : '▶️ Play Simulation'}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleNextStep}
            disabled={currentStopIndex >= stops.length - 1 || isPlaying}
          >
            ⏭️ Next
          </Button>

          <Button size="sm" variant="secondary" onClick={handleReset}>
            🔄 Reset
          </Button>
        </div>
      </div>

      {/* Visual Timeline Path */}
      <div className="route-timeline-container">
        {/* Progress Fill Bar */}
        <div className="route-timeline-track">
          <div
            className="route-timeline-progress"
            style={{
              width: `${(currentStopIndex / (stops.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Stops on Track */}
        <div className="route-stops-grid">
          {stops.map((stop, idx) => {
            const isCurrent = idx === currentStopIndex;
            const isPassed = idx < currentStopIndex;
            const allAbsent =
              stop.students.length > 0 &&
              stop.students.every((s) => s.status === 'not_coming');
            const hasPending = stop.students.some(
              (s) => s.status === 'pending' || s.status === 'no_response'
            );

            let nodeClass = 'stop-node';
            let statusLabel = 'Active';
            let badgeVariant: 'green' | 'red' | 'amber' | 'blue' = 'blue';

            if (isCurrent) nodeClass += ' stop-node-current';
            if (isPassed) nodeClass += ' stop-node-passed';

            if (allAbsent) {
              nodeClass += ' stop-node-skipped';
              statusLabel = 'Skip';
              badgeVariant = 'red';
            } else if (hasPending) {
              statusLabel = 'Pending';
              badgeVariant = 'amber';
            } else if (idx === stops.length - 1) {
              statusLabel = 'School';
              badgeVariant = 'green';
            } else {
              statusLabel = `${stop.students.filter((s) => s.status === 'coming').length} Coming`;
              badgeVariant = 'green';
            }

            return (
              <div
                key={stop.id}
                className={`stop-item ${selectedStop?.id === stop.id ? 'stop-item-selected' : ''}`}
                onClick={() => setSelectedStop(stop)}
              >
                <div className={nodeClass}>
                  {isCurrent ? (
                    <span className="bus-marker-icon">🚌</span>
                  ) : isPassed ? (
                    '✓'
                  ) : allAbsent ? (
                    '✕'
                  ) : (
                    stop.stop_number
                  )}
                </div>

                <div className="stop-info-text">
                  <div className="stop-name-header">{stop.name}</div>
                  <div className="stop-eta-sub">{stop.expected_time}</div>
                  <div className="mt-1">
                    <Badge variant={badgeVariant} size="sm">
                      {statusLabel}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Inspector Drawer */}
      <div className="route-inspector-panel">
        {selectedStop ? (
          <div className="inspector-content">
            <div className="inspector-left">
              <span className="inspector-label">SELECTED STOP</span>
              <h3 className="inspector-stop-title">
                Stop #{selectedStop.stop_number}: {selectedStop.name}
              </h3>
              <p className="inspector-address text-secondary text-xs">
                📍 {selectedStop.address || 'Standard Pickup Point'} &bull; ETA: {selectedStop.expected_time}
              </p>
            </div>

            <div className="inspector-students-list">
              <span className="inspector-label">
                STUDENTS AT THIS STOP ({selectedStop.students.length})
              </span>
              {selectedStop.students.length === 0 ? (
                <span className="text-xs text-secondary">Final school gate drop-off point</span>
              ) : (
                <div className="students-pill-row">
                  {selectedStop.students.map((st) => (
                    <span
                      key={st.id}
                      className={`student-pill student-pill-${st.status}`}
                    >
                      {st.status === 'coming' && '🟢'}
                      {st.status === 'not_coming' && '🔴'}
                      {st.status === 'pending' && '⏳'}
                      {st.name} ({st.status.replace('_', ' ')})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Live Event Stream */}
        <div className="live-event-feed">
          <div className="feed-header">
            <span className="live-radar-dot" />
            <span className="text-xs font-semibold text-secondary">REAL-TIME ROUTE LOGS</span>
          </div>
          <div className="feed-list">
            {logs.slice(0, 3).map((log, i) => (
              <div key={i} className="feed-item">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
