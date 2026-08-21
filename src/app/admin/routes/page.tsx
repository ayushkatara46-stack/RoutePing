'use client';

// =============================================
// Admin Vertical Route Architecture Studio
// Display all routes vertically with full stop metrics,
// interactive stop-by-stop sequencing, and custom builder
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
  class?: string;
  section?: string;
}

interface Stop {
  id: string;
  route_id: string;
  name: string;
  address: string | null;
  stop_number: number;
  expected_time: string | null;
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
  const [loading, setLoading] = useState(true);
  const [filterRouteId, setFilterRouteId] = useState<string>('all');

  // Simulation State per route
  const [activeSimRouteId, setActiveSimRouteId] = useState<string | null>(null);
  const [simStopIndex, setSimStopIndex] = useState<number>(0);

  // Create Route Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [routeForm, setRouteForm] = useState({
    name: '',
    description: '',
    active: true,
  });
  const [dynamicStops, setDynamicStops] = useState<
    Array<{ name: string; address: string; expected_time: string }>
  >([
    { name: 'Civil Lines Gate', address: 'Main Gate #1', expected_time: '06:30 AM' },
    { name: 'Sadar Bazaar Crossing', address: 'Near Clock Tower', expected_time: '06:45 AM' },
  ]);
  const [savingRoute, setSavingRoute] = useState(false);

  // Add Single Stop Modal State
  const [addStopModalOpen, setAddStopModalOpen] = useState(false);
  const [targetRouteId, setTargetRouteId] = useState<string | null>(null);
  const [stopForm, setStopForm] = useState({
    name: '',
    address: '',
    expected_time: '07:00 AM',
  });
  const [savingStop, setSavingStop] = useState(false);

  const toast = useToast();

  const fetchRoutes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/routes');
      const json = await res.json();
      if (json.success && json.data) {
        setRoutes(json.data);
      }
    } catch {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Simulation Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeSimRouteId) {
      const simRoute = routes.find((r) => r.id === activeSimRouteId);
      const stopsCount = simRoute?.stops?.length || 0;

      if (stopsCount > 0) {
        timer = setInterval(() => {
          setSimStopIndex((prev) => {
            if (prev >= stopsCount - 1) {
              setActiveSimRouteId(null);
              toast.success(`Route "${simRoute?.name}" reached final destination! 🏁`);
              return 0;
            }
            return prev + 1;
          });
        }, 2200);
      }
    }
    return () => clearInterval(timer);
  }, [activeSimRouteId, routes, toast]);

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
          { name: 'First Pickup Point', address: '', expected_time: '06:30 AM' },
          { name: 'Second Pickup Point', address: '', expected_time: '06:45 AM' },
        ]);
        fetchRoutes();
      } else {
        toast.error(json.error || 'Failed to create route');
      }
    } catch {
      toast.error('Failed to create route');
    } finally {
      setSavingRoute(false);
    }
  };

  // Handle Add Single Stop to a specific route
  const handleAddStop = async () => {
    if (!stopForm.name.trim() || !targetRouteId) {
      toast.error('Stop name is required');
      return;
    }
    const targetRoute = routes.find((r) => r.id === targetRouteId);
    setSavingStop(true);
    try {
      const res = await fetch('/api/admin/stops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route_id: targetRouteId,
          name: stopForm.name,
          address: stopForm.address,
          expected_time: stopForm.expected_time,
          stop_number: (targetRoute?.stops?.length || 0) + 1,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Stop "${stopForm.name}" added!`);
        setAddStopModalOpen(false);
        setStopForm({
          name: '',
          address: '',
          expected_time: '07:00 AM',
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
        fetchRoutes();
      }
    } catch {
      toast.error('Failed to delete route');
    }
  };

  if (loading) return <PageLoader message="Loading vertical route architecture studio..." />;

  const displayedRoutes =
    filterRouteId === 'all'
      ? routes
      : routes.filter((r) => r.id === filterRouteId);

  const totalAllStops = routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0);
  const totalAllStudents = routes.reduce(
    (acc, r) =>
      acc +
      (r.stops || []).reduce((sAcc, s) => sAcc + (s.students?.length || 0), 0),
    0
  );

  return (
    <div id="admin-routes" className="routes-studio-container space-y-6">
      {/* Top Studio Hero Banner */}
      <div className="admin-hero-banner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="hero-badge-pill">
              <span className="live-radar-dot" />
              ROUTE ARCHITECTURE STUDIO
            </div>
            <h1 className="hero-headline mt-2">
              VERTICAL ROUTE &amp; DISPATCH CONTROL
            </h1>
            <p className="hero-subtext mt-1">
              Real-time vertical metro maps, stop-by-stop telemetry, and custom route sequencing.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            className="shadow-honey flex-shrink-0"
            id="create-new-route-btn"
          >
            ✨ + Create New Route
          </Button>
        </div>

        {/* Global Route Metrics Pills */}
        <div className="grid grid-3 gap-3 mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-black/25 px-4 py-2.5 rounded-lg border border-white/5">
            <span className="text-2xl">🗺️</span>
            <div>
              <div className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                Total Routes
              </div>
              <div className="text-base font-black text-primary">
                {routes.length} Active Corridors
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/25 px-4 py-2.5 rounded-lg border border-white/5">
            <span className="text-2xl">🚏</span>
            <div>
              <div className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                Total Stops
              </div>
              <div className="text-base font-black text-primary">
                {totalAllStops} Mapped Stops
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/25 px-4 py-2.5 rounded-lg border border-white/5">
            <span className="text-2xl">👨‍🎓</span>
            <div>
              <div className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                Assigned Students
              </div>
              <div className="text-base font-black text-accent">
                {totalAllStudents} Enrolled Riders
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Route Switcher Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
        <div className="route-switcher-bar">
          <button
            onClick={() => setFilterRouteId('all')}
            className={cn(
              'route-tab-pill',
              filterRouteId === 'all' && 'route-tab-pill-active'
            )}
          >
            <span className="text-base">📋</span>
            <div className="flex flex-col text-left">
              <span className="route-tab-title">View All Routes Vertically</span>
              <span className="route-tab-subtitle">
                {routes.length} Corridors &bull; {totalAllStops} Total Stops
              </span>
            </div>
          </button>

          {routes.map((route) => {
            const isSelected = filterRouteId === route.id;
            const stopCount = route.stops?.length || 0;
            return (
              <button
                key={route.id}
                onClick={() => setFilterRouteId(route.id)}
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
          })}
        </div>
      </div>

      {/* Vertical Routes List (Each route rendered vertically with full timeline) */}
      {displayedRoutes.length === 0 ? (
        <Card className="liquid-glass-card text-center py-12">
          <CardBody>
            <span className="text-5xl">🚏</span>
            <h3 className="text-lg font-bold text-primary mt-4">
              No routes configured yet
            </h3>
            <p className="text-xs text-secondary mt-1">
              Click "+ Create New Route" above to build your first vertical corridor!
            </p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => setCreateModalOpen(true)}
            >
              ✨ + Create First Route
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-8">
          {displayedRoutes.map((route, rIdx) => {
            const stops = route.stops || [];
            const routeStudentsCount = stops.reduce(
              (acc, s) => acc + (s.students?.length || 0),
              0
            );
            const isSimulating = activeSimRouteId === route.id;

            return (
              <Card
                key={route.id}
                className="vertical-timeline-card border border-honey/20 shadow-2xl"
              >
                {/* Route Header Banner */}
                <div className="vertical-timeline-header bg-black/20">
                  <div className="flex items-center gap-3">
                    <div className="route-icon-badge">🚌</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-primary">
                          {route.name}
                        </h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-honey/15 border border-honey/30 text-accent font-bold">
                          {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 font-bold">
                          {routeStudentsCount} Students
                        </span>
                      </div>
                      <p className="text-xs text-secondary mt-0.5">
                        {route.description || 'GPS Synced High-Priority Route'}
                      </p>
                    </div>
                  </div>

                  {/* Route Action Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isSimulating ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => {
                        if (isSimulating) {
                          setActiveSimRouteId(null);
                          setSimStopIndex(0);
                        } else {
                          setActiveSimRouteId(route.id);
                          setSimStopIndex(0);
                          toast.success(`Starting live simulation for "${route.name}"! 🚌`);
                        }
                      }}
                    >
                      {isSimulating ? '⏸ Pause Sim' : '▶ Play Sim'}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setTargetRouteId(route.id);
                        setAddStopModalOpen(true);
                      }}
                    >
                      + Add Stop
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteRoute(route.id, route.name)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>

                {/* Vertical Stops Sequence */}
                <CardBody className="p-6">
                  {stops.length === 0 ? (
                    <div className="text-center py-8 bg-black/10 rounded-xl border border-white/5">
                      <span className="text-3xl">🚏</span>
                      <p className="text-sm font-bold text-primary mt-2">
                        No stops mapped to this corridor yet
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          setTargetRouteId(route.id);
                          setAddStopModalOpen(true);
                        }}
                      >
                        + Add Stop #1
                      </Button>
                    </div>
                  ) : (
                    <div className="vertical-route-track-container">
                      {/* Vertical Continuous Track Line */}
                      <div className="vertical-track-line" />

                      {/* Stops list */}
                      <div className="space-y-6 relative z-10">
                        {stops.map((stop, sIndex) => {
                          const isCurrent =
                            isSimulating && sIndex === simStopIndex;
                          const isPassed =
                            isSimulating && sIndex < simStopIndex;
                          const isDestination = sIndex === stops.length - 1;
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
                              {/* Left: Stop Node Circle + Time */}
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
                                    <span className="animate-bounce text-sm">
                                      🚌
                                    </span>
                                  ) : isDestination ? (
                                    <span>🏁</span>
                                  ) : isPassed ? (
                                    <span>✓</span>
                                  ) : (
                                    <span>{stop.stop_number || sIndex + 1}</span>
                                  )}
                                </div>

                                <span className="vertical-time-pill">
                                  {stop.expected_time || `Stop #${sIndex + 1}`}
                                </span>
                              </div>

                              {/* Right: Stop Card */}
                              <div className="vertical-stop-card">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-extrabold text-primary">
                                        {stop.name}
                                      </h4>
                                      {isCurrent && (
                                        <span className="live-status-pill">
                                          <span className="live-radar-dot" /> Bus At Stop
                                        </span>
                                      )}
                                      {isDestination && (
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">
                                          Campus Drop-off
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-secondary mt-0.5">
                                      📍 {stop.address || 'Standard Location Point'}
                                    </p>
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleDeleteStop(stop.id, stop.name)
                                    }
                                    className="text-xs text-red-400 hover:text-red-300 p-1 rounded"
                                    title="Delete Stop"
                                  >
                                    🗑️
                                  </button>
                                </div>

                                {/* Student Chips */}
                                <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                                    Students ({stopStudents.length}):
                                  </span>
                                  {stopStudents.length === 0 ? (
                                    <span className="text-xs text-muted italic">
                                      No students assigned yet
                                    </span>
                                  ) : (
                                    stopStudents.map((st) => (
                                      <span
                                        key={st.id}
                                        className="student-chip-artisan"
                                      >
                                        👨‍🎓 {st.name}{' '}
                                        {st.class && (
                                          <span className="opacity-70 text-[10px]">
                                            ({st.class}-{st.section || 'A'})
                                          </span>
                                        )}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Append Next Stop button */}
                      <div className="pt-6 pl-14">
                        <button
                          className="add-vertical-stop-btn"
                          onClick={() => {
                            setTargetRouteId(route.id);
                            setAddStopModalOpen(true);
                          }}
                        >
                          <span className="text-base font-bold">+</span> Add Next Stop to &quot;{route.name}&quot;
                        </button>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* =============================================
          MODAL: CREATE NEW ROUTE + DYNAMIC STOPS
         ============================================= */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="✨ Create New Vertical Route"
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
                      expected_time: '07:00 AM',
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
                      placeholder="Expected Time (e.g. 06:45 AM)"
                      value={stop.expected_time}
                      onChange={(e) => {
                        const copy = [...dynamicStops];
                        copy[idx].expected_time = e.target.value;
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
            Create Route &amp; Sequential Stops
          </Button>
        </ModalFooter>
      </Modal>

      {/* =============================================
          MODAL: ADD SINGLE STOP TO SPECIFIC ROUTE
         ============================================= */}
      <Modal
        open={addStopModalOpen}
        onClose={() => setAddStopModalOpen(false)}
        title="🚏 Add Stop to Route Sequence"
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
            label="Expected Arrival Time"
            value={stopForm.expected_time}
            onChange={(e) =>
              setStopForm({ ...stopForm, expected_time: e.target.value })
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
