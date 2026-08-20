// =============================================
// Route Calculator — Stop State Logic
// =============================================

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTodayDate } from '@/lib/utils';
import type {
  StopState,
  StopWithStudents,
  RouteWithStops,
  StudentWithAttendance,
  RouteSummaryData,
} from '@/types';

/**
 * Calculate the state of a stop based on its students' attendance
 */
function calculateStopState(students: StudentWithAttendance[]): StopState {
  if (students.length === 0) return 'skip_recommended';

  const allPickedUp = students.every(
    (s) => s.attendance?.pickup_status === 'picked_up'
  );
  if (allPickedUp) return 'all_picked_up';

  const somePickedUp = students.some(
    (s) => s.attendance?.pickup_status === 'picked_up'
  );
  if (somePickedUp) return 'picked_up';

  const allNotComing = students.every(
    (s) => s.attendance?.status === 'not_coming'
  );
  if (allNotComing) return 'skip_recommended';

  const hasNoResponse = students.some(
    (s) =>
      !s.attendance ||
      s.attendance.status === 'pending' ||
      s.attendance.status === 'no_response'
  );
  if (hasNoResponse) return 'no_response';

  const hasComing = students.some(
    (s) => s.attendance?.status === 'coming'
  );
  if (hasComing) return 'active';

  return 'no_response';
}

/**
 * Get the full driver route with stop states for today
 */
export async function getDriverRoute(
  driverId: string,
  date?: string
): Promise<RouteWithStops | null> {
  const supabase = createServerSupabaseClient();
  const targetDate = date || getTodayDate();

  // Get the bus and route for this driver
  const { data: bus } = await supabase
    .from('buses')
    .select('*, route:routes(*)')
    .eq('driver_id', driverId)
    .eq('active', true)
    .single();

  if (!bus || !bus.route) return null;

  // Get all stops and students in parallel
  const [{ data: stops }, { data: students }] = await Promise.all([
    supabase
      .from('stops')
      .select('*')
      .eq('route_id', bus.route_id)
      .order('stop_number', { ascending: true }),
    supabase
      .from('students')
      .select(`*, attendance:attendance(*)`)
      .eq('route_id', bus.route_id)
      .eq('active', true),
  ]);

  if (!stops) return null;

  // Build stops with students and states
  const stopsWithStudents: StopWithStudents[] = stops.map((stop) => {
    const stopStudents: StudentWithAttendance[] = (students || [])
      .filter((s: Record<string, unknown>) => s.stop_id === stop.id)
      .map((s: Record<string, unknown>) => {
        const attendanceArr = s.attendance as Record<string, unknown>[];
        const todayAttendance = attendanceArr?.find(
          (a: Record<string, unknown>) => a.date === targetDate
        ) || null;
        return {
          ...s,
          attendance: todayAttendance,
        } as unknown as StudentWithAttendance;
      });

    return {
      ...stop,
      students: stopStudents,
      state: calculateStopState(stopStudents),
    } as unknown as StopWithStudents;
  });

  return {
    ...bus.route,
    stops: stopsWithStudents,
    bus,
  } as unknown as RouteWithStops;
}

/**
 * Calculate route summary stats
 */
export function calculateRouteSummary(
  route: RouteWithStops
): RouteSummaryData {
  let totalStudents = 0;
  let coming = 0;
  let notComing = 0;
  let noResponse = 0;
  let pending = 0;
  let pickedUp = 0;
  let activeStops = 0;
  let skippableStops = 0;

  for (const stop of route.stops) {
    for (const student of stop.students) {
      totalStudents++;
      const status = student.attendance?.status;
      if (status === 'coming') coming++;
      else if (status === 'not_coming') notComing++;
      else if (status === 'no_response') noResponse++;
      else pending++;

      if (student.attendance?.pickup_status === 'picked_up') pickedUp++;
    }

    if (stop.state === 'active' || stop.state === 'no_response') activeStops++;
    if (stop.state === 'skip_recommended') skippableStops++;
  }

  return {
    total_stops: route.stops.length,
    total_students: totalStudents,
    coming,
    not_coming: notComing,
    no_response: noResponse,
    pending,
    picked_up: pickedUp,
    active_stops: activeStops,
    skippable_stops: skippableStops,
  };
}
