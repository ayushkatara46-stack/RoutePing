'use client';

// =============================================
// Admin Students Page
// =============================================

import { useState, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import DataTable from '@/components/ui/DataTable';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';

interface StudentRow {
  id: string;
  name: string;
  class: string;
  section: string | null;
  active: boolean;
  parent?: { name: string; email: string } | null;
  bus?: { bus_number: string } | null;
  route?: { name: string } | null;
  stop?: { name: string } | null;
  [key: string]: unknown;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    section: '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/students?search=${search}`);
      const json = await res.json();
      if (json.success) setStudents(json.data || []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleCreate = async () => {
    if (!formData.name || !formData.class) {
      toast.error('Name and class are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Student created successfully');
        setModalOpen(false);
        setFormData({ name: '', class: '', section: '' });
        fetchStudents();
      } else {
        toast.error(json.error || 'Failed to create student');
      }
    } catch {
      toast.error('Failed to create student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const res = await fetch(`/api/admin/students?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Student deleted');
        fetchStudents();
      }
    } catch {
      toast.error('Failed to delete student');
    }
  };

  if (loading) return <PageLoader message="Loading students..." />;

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'class', header: 'Class', render: (s: StudentRow) => `${s.class}${s.section ? ` - ${s.section}` : ''}` },
    { key: 'parent', header: 'Parent', render: (s: StudentRow) => s.parent?.name || '—' },
    { key: 'bus', header: 'Bus', render: (s: StudentRow) => s.bus?.bus_number || '—' },
    { key: 'route', header: 'Route', render: (s: StudentRow) => s.route?.name || '—' },
    { key: 'stop', header: 'Stop', render: (s: StudentRow) => s.stop?.name || '—' },
    {
      key: 'actions',
      header: '',
      render: (s: StudentRow) => (
        <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div id="admin-students">
      <div className="flex items-center justify-between mb-6">
        <h1>Students</h1>
        <Button variant="primary" onClick={() => setModalOpen(true)} id="add-student-btn">
          + Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
            id="student-search"
          />
        </CardHeader>
        <CardBody>
          <DataTable<StudentRow>
            columns={columns}
            data={students}
            keyField="id"
            emptyMessage="No students found"
          />
        </CardBody>
      </Card>

      {/* Add Student Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Student" size="sm">
        <div className="flex flex-col gap-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            id="student-name-input"
          />
          <Input
            label="Class"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            required
            placeholder="e.g. 5"
            id="student-class-input"
          />
          <Input
            label="Section"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            placeholder="e.g. A"
            id="student-section-input"
          />
        </div>
        <ModalFooter className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={handleCreate} id="save-student-btn">
            Create Student
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
