// =============================================
// Admin Buses API — CRUD
// =============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('buses')
      .select('*, driver:profiles!driver_id(id, name, email), route:routes(id, name)')
      .order('bus_number');

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin buses GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();

    const { data, error } = await supabase.from('buses').insert(body).select().single();
    if (error) throw error;

    await logAuditAction(user?.id || null, 'create', 'bus', data.id, undefined, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin buses POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create bus' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Missing bus id' }, { status: 400 });

    const { data, error } = await supabase.from('buses').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await logAuditAction(user?.id || null, 'update', 'bus', id, undefined, updates);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin buses PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update bus' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Missing bus id' }, { status: 400 });

    const { error } = await supabase.from('buses').delete().eq('id', id);
    if (error) throw error;

    await logAuditAction(user?.id || null, 'delete', 'bus', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin buses DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete bus' }, { status: 500 });
  }
}
