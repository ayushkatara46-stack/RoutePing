// =============================================
// Attendance Business Logic
// =============================================

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTodayDate } from '@/lib/utils';
import type { AttendanceStatus, Attendance } from '@/types';

/**
 * Get or create today's attendance record for a student
 */
export async function getOrCreateTodayAttendance(
  studentId: string
): Promise<Attendance | null> {
  const supabase = createServerSupabaseClient();
  const today = getTodayDate();

  // Try to get existing record
  const { data: existing } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .eq('date', today)
    .single();

  if (existing) return existing as Attendance;

  // Create new pending record
  const { data: created, error } = await supabase
    .from('attendance')
    .insert({
      student_id: studentId,
      date: today,
      status: 'pending',
      pickup_status: 'waiting',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create attendance:', error);
    return null;
  }

  return created as Attendance;
}

/**
 * Update a student's attendance status
 */
export async function updateAttendanceStatus(
  studentId: string,
  status: AttendanceStatus,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  const today = getTodayDate();

  // Ensure record exists
  await getOrCreateTodayAttendance(studentId);

  // Check cutoff
  const isBefore = await isBeforeCutoff();
  if (!isBefore) {
    return { success: false, error: 'Attendance cutoff time has passed' };
  }

  // Update
  const { error } = await supabase
    .from('attendance')
    .update({
      status,
      marked_at: new Date().toISOString(),
      marked_by: userId,
    })
    .eq('student_id', studentId)
    .eq('date', today)
    .eq('locked', false);

  if (error) {
    console.error('Failed to update attendance:', error);
    return { success: false, error: 'Failed to update attendance' };
  }

  return { success: true };
}

/**
 * Check if current time is before the configured cutoff
 */
export async function isBeforeCutoff(providedCutoffTime?: string): Promise<boolean> {
  const cutoffTime = providedCutoffTime || (await getCutoffTime());
  const [cutH, cutM] = cutoffTime.split(':').map(Number);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const cutoffMinutes = cutH * 60 + cutM;

  return currentMinutes < cutoffMinutes;
}

/**
 * Get the cutoff time setting
 */
export async function getCutoffTime(): Promise<string> {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'cutoff_time')
    .single();

  return data?.value ? String(data.value).replace(/"/g, '') : '07:00';
}

/**
 * Get attendance summary for a specific date and bus
 */
export async function getAttendanceSummary(
  date: string,
  busId?: string
) {
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from('attendance')
    .select('status, student_id, students!inner(bus_id)')
    .eq('date', date);

  if (busId) {
    query = query.eq('students.bus_id', busId);
  }

  const { data } = await query;

  if (!data) return { coming: 0, not_coming: 0, no_response: 0, pending: 0, total: 0 };

  const summary = {
    coming: data.filter((a: Record<string, unknown>) => a.status === 'coming').length,
    not_coming: data.filter((a: Record<string, unknown>) => a.status === 'not_coming').length,
    no_response: data.filter((a: Record<string, unknown>) => a.status === 'no_response').length,
    pending: data.filter((a: Record<string, unknown>) => a.status === 'pending').length,
    total: data.length,
  };

  return summary;
}
