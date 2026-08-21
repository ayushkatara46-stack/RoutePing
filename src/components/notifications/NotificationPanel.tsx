'use client';

// =============================================
// Notification Panel Component — Liquid Glass
// With Close Button (✕) and Smooth Glassmorphism
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
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Liquid Glass Backdrop (Click outside to close) */}
      <div
        className="notification-backdrop-glass"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Liquid Glass Slide Panel */}
      <div
        className="notification-panel-liquid"
        id="notification-panel"
        role="dialog"
        aria-label="Notifications Panel"
      >
        {/* Liquid Glass Header */}
        <div className="notification-liquid-header">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <h3 className="text-base font-bold text-primary tracking-wide">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="liquid-unread-badge">{unreadCount}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                className="liquid-action-btn"
                onClick={onMarkAllRead}
                title="Mark all notifications as read"
              >
                Mark all read
              </button>
            )}

            {/* Close Button (✕) */}
            <button
              className="liquid-close-btn"
              onClick={onClose}
              title="Close Notifications (✕)"
              aria-label="Close Notifications"
              id="close-notifications-btn"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Liquid Notification List */}
        <div className="notification-liquid-list">
          {notifications.length === 0 ? (
            <div className="notification-liquid-empty">
              <div className="empty-bell-icon">🔔</div>
              <p className="font-semibold text-primary">All caught up!</p>
              <span className="text-xs text-secondary">
                You have no pending notifications right now.
              </span>
            </div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                className={cn(
                  'notification-liquid-item',
                  !notif.read && 'liquid-item-unread'
                )}
                onClick={() => onMarkRead(notif.id)}
              >
                <span className="notification-type-icon">
                  {TYPE_ICONS[notif.type] || 'ℹ️'}
                </span>
                <div className="notification-content">
                  <div className="flex items-center justify-between">
                    <span className="notification-title">{notif.title}</span>
                    {!notif.read && <span className="liquid-glow-dot" />}
                  </div>
                  <span className="notification-message">{notif.message}</span>
                  <span className="notification-time">
                    {formatTimestamp(notif.created_at)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
