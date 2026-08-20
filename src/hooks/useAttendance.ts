'use client';

// =============================================
// useAttendance Hook — Parent Dashboard
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type { StudentWithDetails, AttendanceStatus } from '@/types';

interface UseAttendanceReturn {
  students: StudentWithDetails[];
  loading: boolean;
  error: string | null;
  updateAttendance: (studentId: string, status: AttendanceStatus) => Promise<boolean>;
  refreshData: () => Promise<void>;
  cutoffTime: string;
  isBeforeCutoff: boolean;
}

export function useAttendance(): UseAttendanceReturn {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cutoffTime, setCutoffTime] = useState('07:00');
  const [isBeforeCutoff, setIsBeforeCutoff] = useState(true);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/attendance');
      const json = await response.json();

      if (json.success) {
        setStudents(json.data.students || []);
        setCutoffTime(json.data.cutoff_time || '07:00');
        setIsBeforeCutoff(json.data.is_before_cutoff ?? true);
      } else {
        setError(json.error || 'Failed to load attendance');
      }
    } catch (err) {
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateAttendance = useCallback(
    async (studentId: string, status: AttendanceStatus): Promise<boolean> => {
      try {
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_id: studentId, status }),
        });

        const json = await response.json();

        if (json.success) {
          // Optimistic update
          setStudents((prev) =>
            prev.map((s) =>
              s.id === studentId
                ? {
                    ...s,
                    attendance: s.attendance
                      ? { ...s.attendance, status }
                      : undefined,
                  }
                : s
            )
          );
          return true;
        }

        return false;
      } catch {
        return false;
      }
    },
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    students,
    loading,
    error,
    updateAttendance,
    refreshData: fetchData,
    cutoffTime,
    isBeforeCutoff,
  };
}

export default useAttendance;
