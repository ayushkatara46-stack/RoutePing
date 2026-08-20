'use client';

// =============================================
// Admin Buses Page
// =============================================

import { useState, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import DataTable from '@/components/ui/DataTable';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';

interface BusRow {
  id: string;
  bus_number: string;
  registration_number: string | null;
  capacity: number;
  active: boolean;
  driver?: { id: string; name: string; email: string } | null;
  route?: { id: string; name: string } | null;
  [key: string]: unknown;
}

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<BusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bus_number: '',
    registration_number: '',
    capacity: 40,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchBuses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/buses');
      const json = await res.json();
      if (json.success) setBuses(json.data || []);
    } catch {
      toast.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const handleCreate = async () => {
    if (!formData.bus_number) {
      toast.error('Bus number is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Bus created');
        setModalOpen(false);
        setFormData({ bus_number: '', registration_number: '', capacity: 40 });
        fetchBuses();
      } else {
        toast.error(json.error || 'Failed to create bus');
      }
    } catch {
      toast.error('Failed to create bus');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bus?')) return;
    try {
      const res = await fetch(`/api/admin/buses?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { toast.success('Bus deleted'); fetchBuses(); }
    } catch { toast.error('Failed to delete bus'); }
  };

  if (loading) return <PageLoader message="Loading buses..." />;

  const columns = [
    { key: 'bus_number', header: 'Bus #' },
    { key: 'registration_number', header: 'Registration', render: (b: BusRow) => b.registration_number || '—' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'driver', header: 'Driver', render: (b: BusRow) => b.driver?.name || '—' },
    { key: 'route', header: 'Route', render: (b: BusRow) => b.route?.name || '—' },
    { key: 'active', header: 'Status', render: (b: BusRow) => b.active ? '🟢 Active' : '🔴 Inactive' },
    {
      key: 'actions', header: '',
      render: (b: BusRow) => (
        <Button variant="danger" size="sm" onClick={() => handleDelete(b.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <div id="admin-buses">
      <div className="flex items-center justify-between mb-6">
        <h1>Buses</h1>
        <Button variant="primary" onClick={() => setModalOpen(true)}>+ Add Bus</Button>
      </div>

      <Card>
        <CardBody>
          <DataTable<BusRow> columns={columns} data={buses} keyField="id" emptyMessage="No buses found" />
        </CardBody>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Bus" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Bus Number" value={formData.bus_number} onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })} required placeholder="e.g. BUS-12" />
          <Input label="Registration Number" value={formData.registration_number} onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })} placeholder="Optional" />
          <Input label="Capacity" type="number" value={String(formData.capacity)} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 40 })} />
        </div>
        <ModalFooter className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleCreate}>Create Bus</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
