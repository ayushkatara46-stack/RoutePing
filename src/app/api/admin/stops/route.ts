// =============================================
// Admin Stops API — CRUD
// =============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get('route_id');

    let query = supabase.from('stops').select('*').order('stop_number');
    if (routeId) query = query.eq('route_id', routeId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin stops GET error:', error);
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
    const body = await request.json();

    const { scheduled_time, ...rest } = body;
    const payload = {
      ...rest,
      expected_time: rest.expected_time || scheduled_time || '07:00 AM',
    };

    const { data, error } = await supabase
      .from('stops')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    await logAuditAction(
      user?.id || null,
      'create',
      'stop',
      data.id,
      undefined,
      payload
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin stops POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create stop' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const body = await request.json();
    const { id, scheduled_time, ...updates } = body;

    if (!id)
      return NextResponse.json(
        { success: false, error: 'Missing stop id' },
        { status: 400 }
      );

    const payload = {
      ...updates,
      ...(scheduled_time ? { expected_time: scheduled_time } : {}),
    };

    const { data, error } = await supabase
      .from('stops')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await logAuditAction(
      user?.id || null,
      'update',
      'stop',
      id,
      undefined,
      payload
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin stops PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update stop' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id)
      return NextResponse.json(
        { success: false, error: 'Missing stop id' },
        { status: 400 }
      );

    const { error } = await supabase.from('stops').delete().eq('id', id);
    if (error) throw error;

    await logAuditAction(user?.id || null, 'delete', 'stop', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin stops DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete stop' },
      { status: 500 }
    );
  }
}
