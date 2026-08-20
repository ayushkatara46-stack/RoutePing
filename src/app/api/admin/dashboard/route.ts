// =============================================
// Admin Dashboard API
// =============================================

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTodayDate } from '@/lib/utils';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = getTodayDate();

    // Get counts
    const [studentsRes, busesRes, attendanceRes] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact' }).eq('active', true),
      supabase.from('buses').select('id', { count: 'exact' }).eq('active', true),
      supabase
        .from('attendance')
        .select('status, student_id, students!inner(bus_id, bus:buses(bus_number))')
        .eq('date', today),
    ]);

    const attendance = attendanceRes.data || [];

    const coming = attendance.filter((a) => a.status === 'coming').length;
    const notComing = attendance.filter((a) => a.status === 'not_coming').length;
    const noResponse = attendance.filter((a) => a.status === 'no_response').length;
    const pending = attendance.filter((a) => a.status === 'pending').length;

    // Group by bus
    const busMap = new Map<string, { bus_number: string; coming: number; not_coming: number; no_response: number; pending: number; total: number }>();
    for (const a of attendance) {
      const students = a.students as unknown as Record<string, unknown>;
      const bus = students?.bus as Record<string, unknown>;
      const busId = students?.bus_id as string;
      const busNumber = (bus?.bus_number as string) || 'Unassigned';

      if (!busMap.has(busId)) {
        busMap.set(busId, { bus_number: busNumber, coming: 0, not_coming: 0, no_response: 0, pending: 0, total: 0 });
      }
      const entry = busMap.get(busId)!;
      entry.total++;
      if (a.status === 'coming') entry.coming++;
      else if (a.status === 'not_coming') entry.not_coming++;
      else if (a.status === 'no_response') entry.no_response++;
      else entry.pending++;
    }

    return NextResponse.json({
      success: true,
      data: {
        total_students: studentsRes.count || 0,
        active_buses: busesRes.count || 0,
        coming,
        not_coming: notComing,
        no_response: noResponse,
        pending,
        buses: Array.from(busMap.entries()).map(([id, data]) => ({
          id,
          ...data,
        })),
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
