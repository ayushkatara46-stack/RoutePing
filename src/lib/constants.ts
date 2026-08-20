// =============================================
// Constants for Bus Notification System
// =============================================

import type { AttendanceStatus, PickupStatus, StopState, UserRole } from '@/types';

// Role constants
export const ROLES: Record<string, UserRole> = {
  PARENT: 'parent',
  DRIVER: 'driver',
  ADMIN: 'admin',
} as const;

// Attendance status constants
export const ATTENDANCE_STATUS: Record<string, AttendanceStatus> = {
  PENDING: 'pending',
  COMING: 'coming',
  NOT_COMING: 'not_coming',
  NO_RESPONSE: 'no_response',
} as const;

// Pickup status constants
export const PICKUP_STATUS: Record<string, PickupStatus> = {
  WAITING: 'waiting',
  PICKED_UP: 'picked_up',
  SKIPPED: 'skipped',
} as const;

// Stop state constants
export const STOP_STATE: Record<string, StopState> = {
  ACTIVE: 'active',
  SKIP_RECOMMENDED: 'skip_recommended',
  NO_RESPONSE: 'no_response',
  PICKED_UP: 'picked_up',
  ALL_PICKED_UP: 'all_picked_up',
} as const;

// Status display configuration
export const STATUS_CONFIG: Record<AttendanceStatus, {
  label: string;
  icon: string;
  colorVar: string;
  className: string;
}> = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    colorVar: '--accent-amber',
    className: 'status-pending',
  },
  coming: {
    label: 'Coming',
    icon: '✓',
    colorVar: '--accent-green',
    className: 'status-coming',
  },
  not_coming: {
    label: 'Not Coming',
    icon: '✗',
    colorVar: '--accent-red',
    className: 'status-not-coming',
  },
  no_response: {
    label: 'No Response',
    icon: '?',
    colorVar: '--accent-amber',
    className: 'status-no-response',
  },
};

// Pickup status display configuration
export const PICKUP_CONFIG: Record<PickupStatus, {
  label: string;
  icon: string;
  className: string;
}> = {
  waiting: {
    label: 'Waiting',
    icon: '⏳',
    className: 'pickup-waiting',
  },
  picked_up: {
    label: 'Picked Up',
    icon: '✓',
    className: 'pickup-done',
  },
  skipped: {
    label: 'Skipped',
    icon: '→',
    className: 'pickup-skipped',
  },
};

// Stop state display configuration
export const STOP_STATE_CONFIG: Record<StopState, {
  label: string;
  icon: string;
  className: string;
}> = {
  active: {
    label: 'Active',
    icon: '●',
    className: 'stop-active',
  },
  skip_recommended: {
    label: 'Skip',
    icon: '→',
    className: 'stop-skip',
  },
  no_response: {
    label: 'Check',
    icon: '?',
    className: 'stop-check',
  },
  picked_up: {
    label: 'Done',
    icon: '✓',
    className: 'stop-done',
  },
  all_picked_up: {
    label: 'Complete',
    icon: '✓✓',
    className: 'stop-complete',
  },
};

// Role-based dashboard routes
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  parent: '/dashboard',
  driver: '/driver',
  admin: '/admin',
} as const;

// Role display labels
export const ROLE_LABELS: Record<UserRole, string> = {
  parent: 'Parent / Student',
  driver: 'Bus Driver',
  admin: 'Administrator',
} as const;

// Date and time format options
export const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

export const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export const SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};

// Greeting by time of day
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Navigation items per role
export const NAV_ITEMS = {
  parent: [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/history', label: 'History', icon: '📅' },
  ],
  driver: [
    { href: '/driver', label: 'Route', icon: '🚌' },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/students', label: 'Students', icon: '👨‍🎓' },
    { href: '/admin/buses', label: 'Buses', icon: '🚌' },
    { href: '/admin/routes', label: 'Routes', icon: '🗺️' },
    { href: '/admin/drivers', label: 'Drivers', icon: '👤' },
    { href: '/admin/attendance', label: 'Attendance', icon: '📋' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ],
} as const;
