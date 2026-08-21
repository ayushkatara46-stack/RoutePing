'use client';

// =============================================
// Admin Vertical Route Studio & Interactive Visualizer
// View routes in vertical metro timeline, add custom routes
// with dynamic stops, and run real-time dispatch simulation
// =============================================

import { useState, useEffect, useCallback } from 'react';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
}

interface Stop {
  id: string;
  route_id: string;
  name: string;
  address: string | null;
  stop_number: number;
  scheduled_time: string | null;
  students?: Student[];
}

interface RouteItem {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  stops: Stop[];
}

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulation State
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Create Route Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [routeForm, setRouteForm] = useState({
    name: '',
    description: '',
    active: true,
  });
  const [dynamicStops, setDynamicStops] = useState<
    Array<{ name: string; address: string; scheduled_time: string }>
  >([
    { name: 'Civil Lines Crossing', address: 'Main Gate #1', scheduled_time: '06:30 AM' },
    { name: 'Sadar Bazaar Point', address: 'Near Post Office', scheduled_time: '06:45 AM' },
  ]);
  const [savingRoute, setSavingRoute] = useState(false);

  // Add Single Stop Modal State
  const [addStopModalOpen, setAddStopModalOpen] = useState(false);
  const [stopForm, setStopForm] = useState({
    name: '',
    address: '',
    scheduled_time: '07:00 AM',
    stop_number: 1,
  });
  const [savingStop, setSavingStop] = useState(false);

  const toast = useToast();

  const fetchRoutes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/routes');
      const json = await res.json();
      if (json.success && json.data) {
        setRoutes(json.data);
        if (json.data.length > 0 && !selectedRouteId) {
          setSelectedRouteId(json.data[0].id);
        }
      }
    } catch {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, [selectedRouteId, toast]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const stops = activeRoute?.stops || [];

  // Reset simulation when route changes
  useEffect(() => {
    setCurrentStopIndex(0);
    setIsPlaying(false);
    if (activeRoute) {
      setLogs([
        `🚌 Route "${activeRoute.name}" loaded with ${stops.length} vertical stops.`,
      ]);
    }
  }, [selectedRouteId, activeRoute, stops.length]);

  // Simulation Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && stops.length > 0) {
      timer = setInterval(() => {
        setCurrentStopIndex((prev) => {
          if (prev >= stops.length - 1) {
            setIsPlaying(false);
            setLogs((l) => [
              `🏁 Route Completed! Bus reached final destination at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              ...l.slice(0, 9),
            ]);
            return prev;
          }
          const nextIndex = prev + 1;
          const nextStop = stops[nextIndex];
          setLogs((l) => [
            `🚏 Bus reached Stop #${nextIndex + 1}: ${nextStop.name} (${nextStop.scheduled_time || 'On Time'})`,
            ...l.slice(0, 9),
          ]);
          return nextIndex;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, stops]);

  // Handle Create Route with Initial Dynamic Stops
  const handleCreateRoute = async () => {
    if (!routeForm.name.trim()) {
      toast.error('Route name is required');
      return;
    }
    setSavingRoute(true);
    try {
      const res = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...routeForm,
          stops: dynamicStops.filter((s) => s.name.trim().length > 0),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Route "${routeForm.name}" created successfully!`);
        setCreateModalOpen(false);
        setRouteForm({ name: '', description: '', active: true });
        setDynamicStops([
          { name: 'First Pickup Point', address: '', scheduled_time: '06:30 AM' },
          { name: 'Second Pickup Point', address: '', scheduled_time: '06:45 AM' },
        ]);
        await fetchRoutes();
        if (json.data?.id) setSelectedRouteId(json.data.id);
      } else {
        toast.error(json.error || 'Failed to create route');
      }
    } catch {
      toast.error('Failed to create route');
    } finally {
      setSavingRoute(false);
    }
  };

  // Handle Add Single Stop to Active Route
  const handleAddStop = async () => {
    if (!stopForm.name.trim() || !activeRoute) {
      toast.error('Stop name is required');
      return;
    }
    setSavingStop(true);
    try {
      const res = await fetch('/api/admin/stops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route_id: activeRoute.id,
          name: stopForm.name,
          address: stopForm.address,
          scheduled_time: stopForm.scheduled_time,
          stop_number: stops.length + 1,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Stop "${stopForm.name}" added to route!`);
        setAddStopModalOpen(false);
        setStopForm({
          name: '',
          address: '',
          scheduled_time: '07:00 AM',
          stop_number: stops.length + 2,
        });
        fetchRoutes();
      } else {
        toast.error(json.error || 'Failed to add stop');
      }
    } catch {
      toast.error('Failed to add stop');
    } finally {
      setSavingStop(false);
    }
  };

  // Handle Delete Stop
  const handleDeleteStop = async (stopId: string, stopName: string) => {
    if (!confirm(`Delete stop "${stopName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/stops?id=${stopId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(`Stop "${stopName}" deleted`);
        fetchRoutes();
      }
    } catch {
      toast.error('Failed to delete stop');
    }
  };

  // Handle Delete Route
  const handleDeleteRoute = async (routeId: string, routeName: string) => {
    if (!confirm(`Are you sure you want to delete route "${routeName}" and all its stops?`))
      return;
    try {
      const res = await fetch(`/api/admin/routes?id=${routeId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(`Route "${routeName}" deleted`);
        setSelectedRouteId(null);
        fetchRoutes();
      }
    } catch {
      toast.error('Failed to delete route');
    }
  };

  if (loading) return <PageLoader message="Loading route architecture studio..." />;

  const totalStudentsInRoute = stops.reduce(
    (acc, st) => acc + (st.students?.length || 0),
    0
  );

  return (
    <div id="admin-routes" className="routes-studio-container">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-primary flex items-center gap-2">
            🗺️ Vertical Route Architecture Studio
          </h1>
          <p className="text-xs text-secondary mt-1">
            Visual vertical stop-by-stop sequencing, dispatch simulation, and real-time student mapping.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setCreateModalOpen(true)}
          className="shadow-honey"
          id="create-new-route-btn"
        >
          ✨ + Create New Route
        </Button>
      </div>

      {/* Route Switcher Tabs */}
      <div className="route-switcher-bar mb-6">
        {routes.length === 0 ? (
          <div className="text-sm text-secondary py-3 px-4 bg-black/20 rounded-lg">
            No routes configured yet. Click <strong>+ Create New Route</strong> to build your first vertical route!
          </div>
        ) : (
          routes.map((route) => {
            const isSelected = route.id === (activeRoute?.id || '');
            const stopCount = route.stops?.length || 0;
            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={cn(
                  'route-tab-pill',
                  isSelected && 'route-tab-pill-active'
                )}
              >
                <span className="text-base">🚌</span>
                <div className="flex flex-col text-left">
                  <span className="route-tab-title">{route.name}</span>
                  <span className="route-tab-subtitle">
                    {stopCount} {stopCount === 1 ? 'Stop' : 'Stops'} &bull;{' '}
                    {route.active ? '🟢 Live' : '⚪ Inactive'}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Main Studio View: Vertical Timeline + Telemetry Panel */}
      {activeRoute && (
        <div className="grid grid-1 lg:grid-3 gap-6 items-start">
          {/* Left / Center 2 Columns: Vertical Metro Route Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="vertical-timeline-card">
              {/* Timeline Header with Controls */}
              <div className="vertical-timeline-header">
                <div className="flex items-center gap-3">
                  <div className="route-icon-badge">🚌</div>
                  <div>
                    <h2 className="text-lg font-bold text-primary">
                      {activeRoute.name}
                    </h2>
                    <p className="text-xs text-secondary">
                      {activeRoute.description || 'Primary School Bus Corridor'}
                    </p>
                  </div>
                </div>

                {/* Simulation Control Bar */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    id="play-vertical-sim-btn"
                  >
                    {isPlaying ? '⏸️ Pause' : '▶️ Play Sim'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setCurrentStopIndex((p) =>
                        Math.min(stops.length - 1, p + 1)
                      )
                    }
                    disabled={currentStopIndex >= stops.length - 1}
                  >
                    ⏭️ Next
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentStopIndex(0);
                      setIsPlaying(false);
                    }}
                  >
                    🔄 Reset
                  </Button>
                </div>
              </div>

              {/* Vertical Metro Line Stops */}
              <CardBody className="p-6">
                {stops.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl">🚏</span>
                    <p className="text-sm font-bold text-primary mt-3">
                      No stops mapped to this route yet
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      Add stops vertically to configure the bus sequence.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-4"
                      onClick={() => setAddStopModalOpen(true)}
                    >
                      + Add First Stop
                    </Button>
                  </div>
                ) : (
                  <div className="vertical-route-track-container">
                    {/* The Continuous Glowing Vertical Metro Track Line */}
                    <div className="vertical-track-line" />

                    {/* Vertical Stop Nodes */}
                    <div className="space-y-8 relative z-10">
                      {stops.map((stop, index) => {
                        const isCurrent = index === currentStopIndex;
                        const isPassed = index < currentStopIndex;
                        const isDestination = index === stops.length - 1;
                        const stopStudents = stop.students || [];

                        return (
                          <div
                            key={stop.id}
                            className={cn(
                              'vertical-stop-row',
                              isCurrent && 'vertical-stop-current',
                              isPassed && 'vertical-stop-passed'
                            )}
                          >
                            {/* Left: Stop Node Circle */}
                            <div className="vertical-node-wrapper">
                              <div
                                className={cn(
                                  'vertical-stop-circle',
                                  isCurrent && 'circle-current-bus',
                                  isPassed && 'circle-passed',
                                  isDestination && 'circle-destination'
                                )}
                              >
                                {isCurrent ? (
                                  <span className="animate-bounce text-sm">🚌</span>
                                ) : isDestination ? (
                                  <span>🏁</span>
                                ) : (
                                  <span>{stop.stop_number || index + 1}</span>
                                )}
                              </div>

                              {/* Stop ETA Badge */}
                              <span className="vertical-time-pill">
                                {stop.scheduled_time || `Stop #${index + 1}`}
                              </span>
                            </div>

                            {/* Right: Stop Content Card */}
                            <div className="vertical-stop-card">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-extrabold text-primary">
                                      {stop.name}
                                    </h4>
                                    {isCurrent && (
                                      <span className="live-status-pill">
                                        <span className="live-radar-dot" /> Current Location
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-secondary mt-0.5">
                                    📍 {stop.address || 'Standard Pickup Point'}
                                  </p>
                                </div>

                                {/* Stop Actions */}
                                <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() =>
                                      handleDeleteStop(stop.id, stop.name)
                                    }
                                    className="stop-action-btn text-red-400"
                                    title="Delete Stop"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>

                              {/* Enrolled Students at this Stop */}
                              <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                                  Enrolled ({stopStudents.length}):
                                </span>
                                {stopStudents.length === 0 ? (
                                  <span className="text-xs text-muted italic">
                                    No students assigned to this stop yet
                                  </span>
                                ) : (
                                  stopStudents.map((st) => (
                                    <span key={st.id} className="student-chip-artisan">
                                      👨‍🎓 {st.name}{' '}
                                      <span className="opacity-70 text-[10px]">
                                        ({st.class}-{st.section})
                                      </span>
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Append Stop Button */}
                    <div className="pt-6 pl-14">
                      <button
                        className="add-vertical-stop-btn"
                        onClick={() => setAddStopModalOpen(true)}
                        id="add-stop-to-route-btn"
                      >
                        <span className="text-base font-bold">+</span> Add Next Stop to this Sequence
                      </button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right 1 Column: Route Telemetry & Live Event Log */}
          <div className="space-y-6">
            {/* Route Stats Card */}
            <Card className="liquid-glass-card">
              <CardHeader className="border-b border-white/10 pb-3">
                <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                  📊 Route Telemetry
                </CardTitle>
              </CardHeader>
              <CardBody className="space-y-4 pt-4">
                <div className="grid grid-2 gap-3">
                  <div className="telemetry-box">
                    <span className="telemetry-label">Total Stops</span>
                    <span className="telemetry-val">{stops.length}</span>
                  </div>
                  <div className="telemetry-box">
                    <span className="telemetry-label">Enrolled Body</span>
                    <span className="telemetry-val text-accent">
                      {totalStudentsInRoute}
                    </span>
                  </div>
                  <div className="telemetry-box">
                    <span className="telemetry-label">Status</span>
                    <span className="telemetry-val text-green-400">
                      {activeRoute.active ? '🟢 Active' : '⚪ Inactive'}
                    </span>
                  </div>
                  <div className="telemetry-box">
                    <span className="telemetry-label">Est. Duration</span>
                    <span className="telemetry-val">
                      {stops.length * 7} Mins
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      handleDeleteRoute(activeRoute.id, activeRoute.name)
                    }
                  >
                    🗑️ Delete Entire Route
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Live Route Dispatch Logs */}
            <Card className="liquid-glass-card">
              <CardHeader className="border-b border-white/10 pb-3">
                <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                  <span className="live-radar-dot" /> Live Route Dispatch Logs
                </CardTitle>
              </CardHeader>
              <CardBody className="pt-3">
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {logs.map((log, i) => (
                    <div key={i} className="route-log-pill">
                      {log}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* =============================================
          MODAL: CREATE NEW ROUTE + DYNAMIC STOPS
         ============================================= */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="✨ Create New Route Architecture"
        size="lg"
      >
        <div className="space-y-6 pt-2">
          {/* Basic Route Info */}
          <div className="grid grid-1 md:grid-2 gap-4">
            <Input
              label="Route Name"
              value={routeForm.name}
              onChange={(e) =>
                setRouteForm({ ...routeForm, name: e.target.value })
              }
              placeholder="e.g. South Zone Fast-Track Express"
              required
            />
            <Input
              label="Route Description"
              value={routeForm.description}
              onChange={(e) =>
                setRouteForm({ ...routeForm, description: e.target.value })
              }
              placeholder="e.g. Serves DPS & Heritage Campuses"
            />
          </div>

          {/* Dynamic Vertical Stops Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                🚏 Sequence Vertical Stops ({dynamicStops.length})
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setDynamicStops((prev) => [
                    ...prev,
                    {
                      name: `Stop #${prev.length + 1}`,
                      address: '',
                      scheduled_time: '07:00 AM',
                    },
                  ])
                }
              >
                + Add Stop
              </Button>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto p-1">
              {dynamicStops.map((stop, idx) => (
                <div key={idx} className="dynamic-stop-builder-row">
                  <div className="stop-builder-number">#{idx + 1}</div>
                  <div className="flex-1 grid grid-1 md:grid-3 gap-2">
                    <input
                      type="text"
                      className="input input-sm"
                      placeholder="Stop Name (e.g. Civil Lines)"
                      value={stop.name}
                      onChange={(e) => {
                        const copy = [...dynamicStops];
                        copy[idx].name = e.target.value;
                        setDynamicStops(copy);
                      }}
                      required
                    />
                    <input
                      type="text"
                      className="input input-sm"
                      placeholder="Address / Landmark"
                      value={stop.address}
                      onChange={(e) => {
                        const copy = [...dynamicStops];
                        copy[idx].address = e.target.value;
                        setDynamicStops(copy);
                      }}
                    />
                    <input
                      type="text"
                      className="input input-sm"
                      placeholder="Time (e.g. 06:45 AM)"
                      value={stop.scheduled_time}
                      onChange={(e) => {
                        const copy = [...dynamicStops];
                        copy[idx].scheduled_time = e.target.value;
                        setDynamicStops(copy);
                      }}
                    />
                  </div>
                  {dynamicStops.length > 1 && (
                    <button
                      className="text-red-400 hover:text-red-300 px-2 text-sm"
                      onClick={() =>
                        setDynamicStops(dynamicStops.filter((_, i) => i !== idx))
                      }
                      title="Remove this stop"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter className="flex justify-end gap-3 mt-6 border-t border-white/10 pt-4">
          <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={savingRoute}
            onClick={handleCreateRoute}
          >
            Create Route & Sequential Stops
          </Button>
        </ModalFooter>
      </Modal>

      {/* =============================================
          MODAL: ADD SINGLE STOP TO ACTIVE ROUTE
         ============================================= */}
      <Modal
        open={addStopModalOpen}
        onClose={() => setAddStopModalOpen(false)}
        title={`🚏 Add Stop to "${activeRoute?.name || ''}"`}
        size="sm"
      >
        <div className="flex flex-col gap-4 pt-2">
          <Input
            label="Stop Name"
            value={stopForm.name}
            onChange={(e) =>
              setStopForm({ ...stopForm, name: e.target.value })
            }
            placeholder="e.g. Sector 14 Metro Station Gate 2"
            required
          />
          <Input
            label="Address / Landmark"
            value={stopForm.address}
            onChange={(e) =>
              setStopForm({ ...stopForm, address: e.target.value })
            }
            placeholder="e.g. Near HDFC Bank ATM"
          />
          <Input
            label="Scheduled Arrival Time"
            value={stopForm.scheduled_time}
            onChange={(e) =>
              setStopForm({ ...stopForm, scheduled_time: e.target.value })
            }
            placeholder="e.g. 06:55 AM"
          />
        </div>

        <ModalFooter className="flex justify-end gap-3 mt-6 border-t border-white/10 pt-4">
          <Button variant="ghost" onClick={() => setAddStopModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={savingStop}
            onClick={handleAddStop}
          >
            Add Stop
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
