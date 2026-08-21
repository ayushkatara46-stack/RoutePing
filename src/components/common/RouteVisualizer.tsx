'use client';

// =============================================
// RouteVisualizer & Live Simulator Component
// Interactive Route Selector, Metro Timeline,
// and Live Multi-Route Telemetry
// =============================================

import { useState, useEffect } from 'react';
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

export interface RouteOption {
  id: string;
  name: string;
  bus_number?: string;
  description?: string;
  stops: VisualStop[];
}

const DEFAULT_DEMO_ROUTES: RouteOption[] = [
  {
    id: 'route-north',
    name: 'Route A — North Zone Express',
    bus_number: 'BUS-01 (Suresh Kumar)',
    description: 'Civil Lines, Sadar Bazaar & DPS School',
    stops: [
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
    ],
  },
  {
    id: 'route-south',
    name: 'Route B — South Zone Fast-Track',
    bus_number: 'BUS-02 (Rajesh Pilot)',
    description: 'Malviya Nagar, Airport Road & Heritage Campus',
    stops: [
      {
        id: 's5',
        name: 'Malviya Nagar Gate 3',
        stop_number: 1,
        expected_time: '06:35 AM',
        address: 'Opp. Central Bank',
        students: [
          { id: 'st6', name: 'Aryan Mehta', status: 'coming' },
        ],
      },
      {
        id: 's6',
        name: 'Airport Road Circle',
        stop_number: 2,
        expected_time: '06:50 AM',
        address: 'Near Terminal 1 Junction',
        students: [
          { id: 'st7', name: 'Ananya Roy', status: 'coming' },
          { id: 'st8', name: 'Kunal Joshi', status: 'coming' },
        ],
      },
      {
        id: 's7',
        name: 'Heritage Campus Gate',
        stop_number: 3,
        expected_time: '07:20 AM',
        address: 'School Entrance Hub',
        students: [],
      },
    ],
  },
];

interface RouteVisualizerProps {
  routeName?: string;
  busNumber?: string;
  stops?: VisualStop[];
  className?: string;
}

export default function RouteVisualizer({
  className = '',
}: RouteVisualizerProps) {
  const [routes, setRoutes] = useState<RouteOption[]>(DEFAULT_DEMO_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    DEFAULT_DEMO_ROUTES[0].id
  );

  // Fetch real routes from API if available
  useEffect(() => {
    async function loadApiRoutes() {
      try {
        const res = await fetch('/api/admin/routes');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const mapped: RouteOption[] = json.data.map((r: any, idx: number) => {
            const rawStops = r.stops || [];
            const mappedStops: VisualStop[] =
              rawStops.length > 0
                ? rawStops.map((st: any, sIdx: number) => ({
                    id: st.id || `stop-${sIdx}`,
                    name: st.name,
                    stop_number: st.stop_number || sIdx + 1,
                    expected_time: st.scheduled_time || '07:00 AM',
                    address: st.address || '',
                    students: (st.students || []).map((s: any) => ({
                      id: s.id,
                      name: s.name,
                      status: 'coming',
                    })),
                  }))
                : DEFAULT_DEMO_ROUTES[0].stops;

            return {
              id: r.id,
              name: r.name,
              bus_number: `BUS-0${idx + 1} (${r.name.includes('North') ? 'Suresh Kumar' : 'Rajesh Pilot'})`,
              description: r.description || 'Live GPS Synced Transit Corridor',
              stops: mappedStops,
            };
          });

          setRoutes(mapped);
          setSelectedRouteId(mapped[0].id);
        }
      } catch {
        // Use default demo routes on error
      }
    }

    loadApiRoutes();
  }, []);

  const currentRoute =
    routes.find((r) => r.id === selectedRouteId) || routes[0];
  const stops = currentRoute.stops;

  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedStop, setSelectedStop] = useState<VisualStop | null>(
    stops[0] || null
  );
  const [savedTimeMinutes, setSavedTimeMinutes] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([
    `Route "${currentRoute.name}" initialized &bull; ${stops.length} stops mapped.`,
  ]);

  // Reset simulation when route changes
  const handleSelectRouteChange = (routeId: string) => {
    setSelectedRouteId(routeId);
    const targetRoute = routes.find((r) => r.id === routeId) || routes[0];
    setCurrentStopIndex(0);
    setIsPlaying(false);
    setSelectedStop(targetRoute.stops[0] || null);
    setSavedTimeMinutes(0);
    setLogs([
      `Switched to "${targetRoute.name}" &bull; ${targetRoute.stops.length} stops mapped.`,
    ]);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && stops.length > 0) {
      timer = setInterval(() => {
        setCurrentStopIndex((prev) => {
          if (prev >= stops.length - 1) {
            setIsPlaying(false);
            setLogs((l) => [
              `🏁 Route Completed — All students arrived safely at campus.`,
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
              `🚌 Arrived at Stop #${nextIndex + 1}: ${nextStop.name}`,
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
    setLogs([`Route "${currentRoute.name}" ready &bull; Standing by for run.`]);
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
      {/* Header with Route Selection Dropdown & Controls */}
      <div className="route-header-clean">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="route-pill-live">
            <span className="live-radar-dot" />
            LIVE ROUTE
          </div>

          {/* Interactive Route Dropdown Selector */}
          <div className="route-select-wrapper">
            <span className="text-xs text-secondary font-bold uppercase tracking-wider mr-1">
              Active Route:
            </span>
            <select
              className="route-select-control"
              value={selectedRouteId}
              onChange={(e) => handleSelectRouteChange(e.target.value)}
              id="active-route-dropdown"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  🚌 {r.name} ({r.stops.length} Stops)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="route-actions-clean">
          {savedTimeMinutes > 0 && (
            <div className="saved-pill-clean">
              <span>
                ⚡ Saved: <strong>{savedTimeMinutes} mins</strong>
              </span>
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

      {/* Route Info Sub-Banner */}
      <div className="route-sub-banner">
        <span className="text-xs text-secondary">
          Assigned Vehicle: <strong className="text-primary">{currentRoute.bus_number}</strong> &bull;{' '}
          {currentRoute.description}
        </span>
      </div>

      {/* Timeline Section */}
      <div className="route-timeline-clean">
        {/* Track Bar (Centered with nodes) */}
        <div className="timeline-track-bar">
          <div
            className="timeline-track-fill"
            style={{
              width:
                stops.length > 1
                  ? `${(currentStopIndex / (stops.length - 1)) * 100}%`
                  : '0%',
            }}
          />
        </div>

        {/* Nodes Row */}
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

            if (isCurrent) {
              nodeStateClass = 'node-active';
            } else if (isPassed) {
              nodeStateClass = 'node-completed';
            }

            if (allAbsent) {
              badgeText = 'Skip (Absent)';
              if (!isPassed && !isCurrent) nodeStateClass = 'node-skipped';
            } else if (idx === stops.length - 1) {
              badgeText = 'Campus';
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
                    stop.stop_number || idx + 1
                  )}
                </div>

                {/* Stop Label info below */}
                <div className="timeline-stop-details">
                  <div className="timeline-stop-title">{stop.name}</div>
                  <div className="timeline-stop-time">{stop.expected_time}</div>
                  <div className="mt-1.5">
                    <span
                      className={`timeline-stop-badge ${
                        allAbsent
                          ? 'badge-skip'
                          : isCurrent
                            ? 'badge-current'
                            : 'badge-coming'
                      }`}
                    >
                      {badgeText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stop Details & Event Log Footer */}
      <div className="route-footer-clean">
        {selectedStop && (
          <div className="footer-stop-info">
            <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Stop Details &bull; #{selectedStop.stop_number}
            </div>
            <div className="text-sm font-bold text-primary mb-1">
              {selectedStop.name}{' '}
              {selectedStop.address && (
                <span className="text-xs text-secondary font-normal">
                  ({selectedStop.address})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedStop.students.length === 0 ? (
                <span className="text-xs text-secondary">
                  Final Drop-off Destination
                </span>
              ) : (
                selectedStop.students.map((st) => (
                  <span
                    key={st.id}
                    className={`student-chip-clean student-chip-${st.status}`}
                  >
                    {st.status === 'coming'
                      ? '✓'
                      : st.status === 'not_coming'
                        ? '✕'
                        : '⏳'}{' '}
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
              <div
                key={i}
                className="text-xs text-secondary bg-black/20 px-2.5 py-1 rounded border border-white/5"
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
