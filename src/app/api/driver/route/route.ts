// =============================================
// Driver Route API
// GET: Today's route with stop states
// =============================================

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getDriverRoute, calculateRouteSummary } from '@/lib/route-calculator';

export const dynamic = 'force-dynamic';

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

    // Verify user is a driver
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'driver' && profile.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Not authorized as driver' },
        { status: 403 }
      );
    }

    const route = await getDriverRoute(user.id);

    if (!route) {
      return NextResponse.json({
        success: false,
        error: 'No route assigned',
      });
    }

    const summary = calculateRouteSummary(route);

    return NextResponse.json({
      success: true,
      data: {
        route,
        summary,
      },
    });
  } catch (error) {
    console.error('Driver route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
