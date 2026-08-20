// =============================================
// Attendance History API Route
// =============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Get parent's students
    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('parent_id', user.id);

    const studentIds = students?.map((s) => s.id) || [];

    if (studentId && !studentIds.includes(studentId)) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    const targetIds = studentId ? [studentId] : studentIds;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: history } = await supabase
      .from('attendance')
      .select('*')
      .in('student_id', targetIds)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Calculate stats
    const records = history || [];
    const stats = {
      total_days: records.length,
      coming_days: records.filter((r) => r.status === 'coming').length,
      absent_days: records.filter((r) => r.status === 'not_coming').length,
      no_response_days: records.filter((r) => r.status === 'no_response').length,
      attendance_percentage:
        records.length > 0
          ? Math.round(
              (records.filter((r) => r.status === 'coming').length /
                records.length) *
                100
            )
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: { history: records, stats },
    });
  } catch (error) {
    console.error('Attendance history error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
