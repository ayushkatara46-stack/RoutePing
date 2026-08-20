// =============================================
// TypeScript Types for Bus Notification System
// =============================================

// Database enum types
export type UserRole = 'parent' | 'driver' | 'admin';
export type AttendanceStatus = 'pending' | 'coming' | 'not_coming' | 'no_response';
export type PickupStatus = 'waiting' | 'picked_up' | 'skipped';
export type NotificationType = 'reminder' | 'final_reminder' | 'confirmation' | 'route_update' | 'system';

// Stop state (calculated)
export type StopState = 'active' | 'skip_recommended' | 'no_response' | 'picked_up' | 'all_picked_up';

// =============================================
// Database Entity Types
// =============================================

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  section: string | null;
  parent_id: string | null;
  bus_id: string | null;
  route_id: string | null;
  stop_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bus {
  id: string;
  bus_number: string;
  registration_number: string | null;
  capacity: number;
  driver_id: string | null;
  route_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stop {
  id: string;
  route_id: string;
  stop_number: number;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  expected_time: string; // TIME as HH:MM:SS
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string; // DATE as YYYY-MM-DD
  status: AttendanceStatus;
  pickup_status: PickupStatus;
  marked_at: string | null;
  marked_by: string | null;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  subscription: object;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: unknown;
  updated_at: string;
}

// =============================================
// Joined / Enriched Types (for API responses)
// =============================================

export interface StudentWithDetails extends Student {
  bus?: Bus;
  route?: Route;
  stop?: Stop;
  parent?: Profile;
  attendance?: Attendance;
}

export interface StopWithStudents extends Stop {
  students: StudentWithAttendance[];
  state: StopState;
}

export interface StudentWithAttendance extends Student {
  attendance: Attendance | null;
}

export interface RouteWithStops extends Route {
  stops: StopWithStudents[];
  bus?: Bus;
}

export interface BusWithDetails extends Bus {
  driver?: Profile;
  route?: RouteWithStops;
}

// =============================================
// Dashboard Types
// =============================================

export interface ParentDashboardData {
  students: StudentWithDetails[];
  cutoff_time: string;
  is_before_cutoff: boolean;
}

export interface DriverDashboardData {
  bus: Bus;
  route: RouteWithStops;
  summary: RouteSummaryData;
}

export interface RouteSummaryData {
  total_stops: number;
  total_students: number;
  coming: number;
  not_coming: number;
  no_response: number;
  pending: number;
  picked_up: number;
  active_stops: number;
  skippable_stops: number;
}

export interface AdminDashboardData {
  total_students: number;
  active_buses: number;
  coming: number;
  not_coming: number;
  no_response: number;
  pending: number;
  buses: BusSummary[];
  avg_stops_saved: number;
}

export interface BusSummary {
  bus: Bus;
  total_students: number;
  coming: number;
  not_coming: number;
  no_response: number;
  pending: number;
}

// =============================================
// API Request / Response Types
// =============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateAttendanceRequest {
  student_id: string;
  status: 'coming' | 'not_coming';
}

export interface UpdatePickupRequest {
  student_id: string;
  pickup_status: PickupStatus;
}

export interface CreateStudentRequest {
  name: string;
  class: string;
  section?: string;
  parent_id?: string;
  bus_id?: string;
  route_id?: string;
  stop_id?: string;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  active?: boolean;
}

export interface CreateBusRequest {
  bus_number: string;
  registration_number?: string;
  capacity?: number;
  driver_id?: string;
  route_id?: string;
}

export interface CreateRouteRequest {
  name: string;
  description?: string;
}

export interface CreateStopRequest {
  route_id: string;
  stop_number: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  expected_time: string;
}

export interface UpdateSettingsRequest {
  cutoff_time?: string;
  reminder_time?: string;
  final_reminder_time?: string;
  timezone?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================
// Attendance History Types
// =============================================

export interface AttendanceHistoryEntry {
  date: string;
  status: AttendanceStatus;
  pickup_status: PickupStatus;
  marked_at: string | null;
}

export interface AttendanceStats {
  total_days: number;
  coming_days: number;
  absent_days: number;
  no_response_days: number;
  attendance_percentage: number;
}
