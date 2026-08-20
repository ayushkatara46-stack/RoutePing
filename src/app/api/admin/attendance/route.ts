// =============================================
// Admin Attendance API
// =============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTodayDate } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getTodayDate();
    const busId = searchParams.get('bus_id');

    let query = supabase
      .from('attendance')
      .select('*, student:students(name, class, section, bus_id, stop_id, bus:buses(bus_number), stop:stops(name))')
      .eq('date', date)
      .order('created_at');

    if (busId) {
      query = query.eq('student.bus_id', busId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin attendance GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Missing attendance id' }, { status: 400 });

    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction(user?.id || null, 'admin_override', 'attendance', id, undefined, updates);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin attendance PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update attendance' }, { status: 500 });
  }
}
