// =============================================
// Attendance API Route (Parent)
// GET: Fetch today's attendance for user's students
// POST: Update attendance status
// =============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getOrCreateTodayAttendance,
  updateAttendanceStatus,
  isBeforeCutoff,
  getCutoffTime,
} from '@/lib/attendance';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';
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

    // Fetch students and cutoff time in parallel
    const [{ data: students }, cutoffTime] = await Promise.all([
      supabase
        .from('students')
        .select(
          `*,
          bus:buses(*),
          route:routes(*),
          stop:stops(*),
          attendance:attendance(*)`
        )
        .eq('parent_id', user.id)
        .eq('active', true),
      getCutoffTime(),
    ]);

    const beforeCutoff = await isBeforeCutoff(cutoffTime);

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        data: { students: [], cutoff_time: cutoffTime, is_before_cutoff: beforeCutoff },
      });
    }

    // Ensure attendance records exist and attach today's
    const studentsWithAttendance = await Promise.all(
      students.map(async (student) => {
        const attendanceArr = student.attendance as Record<string, unknown>[];
        let todayAttendance = attendanceArr?.find(
          (a: Record<string, unknown>) => a.date === today
        );

        if (!todayAttendance) {
          todayAttendance = ((await getOrCreateTodayAttendance(student.id)) as Record<string, unknown> | null) || undefined;
        }

        return {
          ...student,
          attendance: todayAttendance || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        students: studentsWithAttendance,
        cutoff_time: cutoffTime,
        is_before_cutoff: beforeCutoff,
      },
    });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { student_id, status } = body;

    if (!student_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing student_id or status' },
        { status: 400 }
      );
    }

    // Verify student belongs to this parent
    const { data: student } = await supabase
      .from('students')
      .select('id, name, parent_id')
      .eq('id', student_id)
      .eq('parent_id', user.id)
      .single();

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    const result = await updateAttendanceStatus(student_id, status, user.id);

    if (result.success) {
      await logAuditAction(
        user.id,
        'attendance_update',
        'attendance',
        student_id,
        undefined,
        { status, student_name: student.name }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
