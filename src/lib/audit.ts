// =============================================
// Audit Logging
// =============================================

import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Log an audit action
 */
export async function logAuditAction(
  userId: string | null,
  action: string,
  entityType: string,
  entityId?: string,
  oldValue?: Record<string, unknown>,
  newValue?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();

    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      old_value: oldValue || null,
      new_value: newValue || null,
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
}
