// =============================================
// Admin Routes API — CRUD with Nested Stops
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
      .select(`
        *,
        stops (
          id,
          route_id,
          name,
          address,
          stop_number,
          expected_time,
          students (
            id,
            name,
            class,
            section
          )
        )
      `)
      .order('name');

    if (error) throw error;

    // Sort nested stops by stop_number ascending
    const routesWithSortedStops = (data || []).map((route: any) => ({
      ...route,
      stops: (route.stops || []).sort(
        (a: any, b: any) => (a.stop_number || 0) - (b.stop_number || 0)
      ),
    }));

    return NextResponse.json({ success: true, data: routesWithSortedStops });
  } catch (error) {
    console.error('Admin routes GET error:', error);
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

    const { stops: initialStops, ...routePayload } = body;

    // 1. Insert Route
    const { data: newRoute, error: routeError } = await supabase
      .from('routes')
      .insert(routePayload)
      .select()
      .single();

    if (routeError) throw routeError;

    // 2. Insert initial stops if provided
    if (initialStops && Array.isArray(initialStops) && initialStops.length > 0) {
      const stopsToInsert = initialStops.map((s: any, idx: number) => ({
        route_id: newRoute.id,
        name: s.name,
        address: s.address || '',
        stop_number: s.stop_number || idx + 1,
        expected_time: s.expected_time || s.scheduled_time || '07:00 AM',
      }));

      const { error: stopsError } = await supabase
        .from('stops')
        .insert(stopsToInsert);

      if (stopsError) {
        console.error('Failed to insert initial stops:', stopsError);
      }
    }

    await logAuditAction(
      user?.id || null,
      'create',
      'route',
      newRoute.id,
      undefined,
      body
    );

    return NextResponse.json({ success: true, data: newRoute });
  } catch (error) {
    console.error('Admin routes POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create route' },
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
    const { id, stops, ...updates } = body;

    if (!id)
      return NextResponse.json(
        { success: false, error: 'Missing route id' },
        { status: 400 }
      );

    const { data, error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction(
      user?.id || null,
      'update',
      'route',
      id,
      undefined,
      updates
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin routes PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update route' },
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
        { success: false, error: 'Missing route id' },
        { status: 400 }
      );

    // Delete associated stops first
    await supabase.from('stops').delete().eq('route_id', id);

    const { error } = await supabase.from('routes').delete().eq('id', id);
    if (error) throw error;

    await logAuditAction(user?.id || null, 'delete', 'route', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin routes DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete route' },
      { status: 500 }
    );
  }
}
