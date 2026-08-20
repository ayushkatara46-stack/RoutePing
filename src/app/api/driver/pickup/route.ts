// =============================================
// Driver Pickup API
// POST: Mark student as picked up or skip stop
// =============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';
import { getTodayDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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
    const { student_id, pickup_status } = body;

    if (!student_id || !pickup_status) {
      return NextResponse.json(
        { success: false, error: 'Missing student_id or pickup_status' },
        { status: 400 }
      );
    }

    const today = getTodayDate();

    const { error } = await supabase
      .from('attendance')
      .update({ pickup_status })
      .eq('student_id', student_id)
      .eq('date', today);

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update pickup status' },
        { status: 500 }
      );
    }

    await logAuditAction(user.id, 'pickup_update', 'attendance', student_id, undefined, {
      pickup_status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pickup POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
