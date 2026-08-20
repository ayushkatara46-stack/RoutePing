// =============================================
// Notification Helpers
// =============================================

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { NotificationType } from '@/types';

/**
 * Create an in-app notification for a user
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<boolean> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
  });

  if (error) {
    console.error('Failed to create notification:', error);
    return false;
  }

  return true;
}

/**
 * Send reminder notifications to all parents with pending attendance
 */
export async function sendReminderNotifications(): Promise<number> {
  const supabase = createServerSupabaseClient();
  const today = new Date().toISOString().split('T')[0];

  // Find students with pending attendance
  const { data: pendingStudents } = await supabase
    .from('students')
    .select('id, name, parent_id, attendance!inner(status)')
    .eq('active', true)
    .eq('attendance.date', today)
    .eq('attendance.status', 'pending');

  if (!pendingStudents || pendingStudents.length === 0) return 0;

  let count = 0;
  const parentIds = new Set<string>();

  for (const student of pendingStudents) {
    if (student.parent_id && !parentIds.has(student.parent_id)) {
      parentIds.add(student.parent_id);
      await createNotification(
        student.parent_id,
        'reminder',
        'Attendance Reminder',
        `Please confirm if ${student.name} will be taking the bus today.`
      );
      count++;
    }
  }

  return count;
}
