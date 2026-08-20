'use client';

// =============================================
// Admin Dashboard Page
// =============================================

import { useState, useEffect } from 'react';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';

interface DashboardData {
  total_students: number;
  active_buses: number;
  coming: number;
  not_coming: number;
  no_response: number;
  pending: number;
  buses: Array<{
    id: string;
    bus_number: string;
    coming: number;
    not_coming: number;
    no_response: number;
    pending: number;
    total: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {
        // Handle silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageLoader message="Loading dashboard..." />;
  if (!data) return <div className="empty-state"><p>Failed to load dashboard</p></div>;

  return (
    <div className="admin-dashboard" id="admin-dashboard">
      <h1 className="mb-6">Dashboard Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-4 gap-4 mb-8">
        <StatCard
          label="Total Students"
          value={data.total_students}
          accent="purple"
          icon={<span>👨‍🎓</span>}
        />
        <StatCard
          label="Active Buses"
          value={data.active_buses}
          accent="blue"
          icon={<span>🚌</span>}
        />
        <StatCard
          label="Coming Today"
          value={data.coming}
          accent="green"
          icon={<span>✓</span>}
        />
        <StatCard
          label="Not Coming"
          value={data.not_coming}
          accent="red"
          icon={<span>✗</span>}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-3 gap-4 mb-8">
        <StatCard
          label="No Response"
          value={data.no_response}
          accent="amber"
          icon={<span>?</span>}
        />
        <StatCard
          label="Pending"
          value={data.pending}
          accent="amber"
          icon={<span>⏳</span>}
        />
        <StatCard
          label="Response Rate"
          value={
            data.total_students > 0
              ? `${Math.round(
                  ((data.coming + data.not_coming) / data.total_students) * 100
                )}%`
              : '0%'
          }
          accent="purple"
          icon={<span>📊</span>}
        />
      </div>

      {/* Bus Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Bus Overview</CardTitle>
        </CardHeader>
        <CardBody>
          {data.buses.length === 0 ? (
            <p className="text-secondary">No buses with students today</p>
          ) : (
            <div className="grid grid-auto gap-4">
              {data.buses.map((bus) => (
                <div key={bus.id} className="bus-overview-card">
                  <div className="bus-overview-header">
                    <span className="bus-overview-number">🚌 {bus.bus_number}</span>
                    <span className="text-sm text-secondary">
                      {bus.total} students
                    </span>
                  </div>
                  <div className="bus-overview-stats">
                    <span className="bus-stat bus-stat-coming">
                      ✓ {bus.coming}
                    </span>
                    <span className="bus-stat bus-stat-absent">
                      ✗ {bus.not_coming}
                    </span>
                    <span className="bus-stat bus-stat-pending">
                      ? {bus.no_response + bus.pending}
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="bus-overview-bar">
                    <div
                      className="bus-bar-fill bus-bar-coming"
                      style={{
                        width: `${(bus.coming / Math.max(bus.total, 1)) * 100}%`,
                      }}
                    />
                    <div
                      className="bus-bar-fill bus-bar-absent"
                      style={{
                        width: `${(bus.not_coming / Math.max(bus.total, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
