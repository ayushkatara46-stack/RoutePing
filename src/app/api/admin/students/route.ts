// =============================================
// Admin Students API — CRUD
// =============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = supabase
      .from('students')
      .select('*, parent:profiles!parent_id(name, email), bus:buses(bus_number), route:routes(name), stop:stops(name)')
      .order('name');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin students GET error:', error);
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

    const { data, error } = await supabase
      .from('students')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction(user?.id || null, 'create', 'student', data.id, undefined, body);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin students POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create student' },
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing student id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction(user?.id || null, 'update', 'student', id, undefined, updates);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin students PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update student' },
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing student id' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('students').delete().eq('id', id);

    if (error) throw error;

    await logAuditAction(user?.id || null, 'delete', 'student', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin students DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
