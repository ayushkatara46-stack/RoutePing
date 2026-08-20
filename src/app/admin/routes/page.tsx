'use client';

// =============================================
// Admin Routes Page
// =============================================

import { useState, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import DataTable from '@/components/ui/DataTable';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';

interface RouteRow {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  stops: Array<{ count: number }>;
  [key: string]: unknown;
}

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchRoutes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/routes');
      const json = await res.json();
      if (json.success) setRoutes(json.data || []);
    } catch {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleCreate = async () => {
    if (!formData.name) { toast.error('Route name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Route created');
        setModalOpen(false);
        setFormData({ name: '', description: '' });
        fetchRoutes();
      }
    } catch { toast.error('Failed to create route'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this route?')) return;
    try {
      const res = await fetch(`/api/admin/routes?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { toast.success('Route deleted'); fetchRoutes(); }
    } catch { toast.error('Failed to delete route'); }
  };

  if (loading) return <PageLoader message="Loading routes..." />;

  const columns = [
    { key: 'name', header: 'Route Name' },
    { key: 'description', header: 'Description', render: (r: RouteRow) => r.description || '—' },
    { key: 'stops', header: 'Stops', render: (r: RouteRow) => r.stops?.[0]?.count ?? 0 },
    { key: 'active', header: 'Status', render: (r: RouteRow) => r.active ? '🟢 Active' : '🔴 Inactive' },
    {
      key: 'actions', header: '',
      render: (r: RouteRow) => (
        <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <div id="admin-routes">
      <div className="flex items-center justify-between mb-6">
        <h1>Routes</h1>
        <Button variant="primary" onClick={() => setModalOpen(true)}>+ Add Route</Button>
      </div>

      <Card>
        <CardBody>
          <DataTable<RouteRow> columns={columns} data={routes} keyField="id" emptyMessage="No routes found" />
        </CardBody>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Route" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Route Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Jaipur North Route" />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional" />
        </div>
        <ModalFooter className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleCreate}>Create Route</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
