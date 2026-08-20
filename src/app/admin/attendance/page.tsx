'use client';

// =============================================
// Admin Attendance Page
// =============================================

import { useState, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { getTodayDate } from '@/lib/utils';
import { STATUS_CONFIG } from '@/lib/constants';
import type { AttendanceStatus } from '@/types';

interface AttendanceRow {
  id: string;
  status: AttendanceStatus;
  pickup_status: string;
  date: string;
  student: {
    name: string;
    class: string;
    section: string | null;
    bus?: { bus_number: string } | null;
    stop?: { name: string } | null;
  };
  [key: string]: unknown;
}

export default function AdminAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(getTodayDate());
  const toast = useToast();

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance?date=${date}`);
      const json = await res.json();
      if (json.success) setAttendance(json.data || []);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [date, toast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (a: AttendanceRow) => a.student?.name || '—',
    },
    {
      key: 'class',
      header: 'Class',
      render: (a: AttendanceRow) =>
        `${a.student?.class || ''}${a.student?.section ? ` - ${a.student.section}` : ''}`,
    },
    {
      key: 'bus',
      header: 'Bus',
      render: (a: AttendanceRow) => a.student?.bus?.bus_number || '—',
    },
    {
      key: 'stop',
      header: 'Stop',
      render: (a: AttendanceRow) => a.student?.stop?.name || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (a: AttendanceRow) => {
        const config = STATUS_CONFIG[a.status];
        const variantMap: Record<string, 'green' | 'red' | 'amber'> = {
          coming: 'green',
          not_coming: 'red',
          pending: 'amber',
          no_response: 'amber',
        };
        return (
          <Badge variant={variantMap[a.status] || 'default'}>
            {config.icon} {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'pickup_status',
      header: 'Pickup',
      render: (a: AttendanceRow) => {
        if (a.pickup_status === 'picked_up')
          return <Badge variant="green">✓ Picked Up</Badge>;
        if (a.pickup_status === 'skipped')
          return <Badge variant="red">→ Skipped</Badge>;
        return <span className="text-secondary">Waiting</span>;
      },
    },
  ];

  return (
    <div id="admin-attendance">
      <div className="flex items-center justify-between mb-6">
        <h1>Attendance</h1>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          id="attendance-date-picker"
        />
      </div>

      <Card>
        <CardBody>
          {loading ? (
            <PageLoader message="Loading..." />
          ) : (
            <DataTable<AttendanceRow>
              columns={columns}
              data={attendance}
              keyField="id"
              emptyMessage="No attendance records for this date"
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
