'use client';

// =============================================
// Admin Drivers Page
// =============================================

import { useState, useEffect, useCallback } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';

interface DriverRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  [key: string]: unknown;
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/drivers');
      const json = await res.json();
      if (json.success) setDrivers(json.data || []);
    } catch {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  if (loading) return <PageLoader message="Loading drivers..." />;

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone', render: (d: DriverRow) => d.phone || '—' },
  ];

  return (
    <div id="admin-drivers">
      <h1 className="mb-6">Drivers</h1>
      <Card>
        <CardBody>
          <DataTable<DriverRow>
            columns={columns}
            data={drivers}
            keyField="id"
            emptyMessage="No drivers found. Create driver accounts through Supabase Auth."
          />
        </CardBody>
      </Card>
    </div>
  );
}
