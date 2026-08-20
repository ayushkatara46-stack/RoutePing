// =============================================
// Admin Routes API — CRUD
// =============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('routes')
      .select('*, stops(count)')
      .order('name');

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin routes GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();

    const { data, error } = await supabase.from('routes').insert(body).select().single();
    if (error) throw error;

    await logAuditAction(user?.id || null, 'create', 'route', data.id, undefined, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin routes POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create route' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Missing route id' }, { status: 400 });

    const { data, error } = await supabase.from('routes').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await logAuditAction(user?.id || null, 'update', 'route', id, undefined, updates);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin routes PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update route' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Missing route id' }, { status: 400 });

    const { error } = await supabase.from('routes').delete().eq('id', id);
    if (error) throw error;

    await logAuditAction(user?.id || null, 'delete', 'route', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin routes DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete route' }, { status: 500 });
  }
}
