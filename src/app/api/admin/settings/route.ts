// =============================================
// Admin Settings API
// =============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from('system_settings').select('*');

    if (error) throw error;

    // Convert array to key-value object
    const settings: Record<string, unknown> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Admin settings GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await supabase
        .from('system_settings')
        .upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() });
    }

    await logAuditAction(user?.id || null, 'update', 'settings', undefined, undefined, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin settings PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
