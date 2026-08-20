'use client';

// =============================================
// Notification Panel Component
// =============================================

import { formatTimestamp } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

const TYPE_ICONS: Record<string, string> = {
  reminder: '⏰',
  final_reminder: '🚨',
  confirmation: '✅',
  route_update: '🗺️',
  system: 'ℹ️',
};

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationPanel({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: NotificationPanelProps) {
  return (
    <>
      <div className="notification-backdrop" onClick={onClose} />
      <div className="notification-panel" id="notification-panel">
        <div className="notification-panel-header">
          <h3>Notifications</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onMarkAllRead}
          >
            Mark all read
          </button>
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <span>🔔</span>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                className={cn(
                  'notification-item',
                  !notif.read && 'notification-unread'
                )}
                onClick={() => onMarkRead(notif.id)}
              >
                <span className="notification-type-icon">
                  {TYPE_ICONS[notif.type] || 'ℹ️'}
                </span>
                <div className="notification-content">
                  <span className="notification-title">{notif.title}</span>
                  <span className="notification-message">{notif.message}</span>
                  <span className="notification-time">
                    {formatTimestamp(notif.created_at)}
                  </span>
                </div>
                {!notif.read && <span className="notification-dot" />}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
