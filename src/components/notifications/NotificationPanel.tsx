'use client';

// =============================================
// Notification Panel Component — Liquid Glass
// Clean Border Resizing without Bulky Arrow Buttons
// =============================================

import { useState, useEffect, useCallback } from 'react';
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

const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 280;
const MAX_WIDTH = 750;
const SNAP_CLOSE_THRESHOLD = 180;

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
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Load saved width
  useEffect(() => {
    try {
      const saved = localStorage.getItem('notification_panel_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          setWidth(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Global mouse & touch listeners for smooth dragging from right-pinned panel
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth < SNAP_CLOSE_THRESHOLD) {
        onClose();
      } else {
        const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth));
        setWidth(clamped);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const newWidth = window.innerWidth - e.touches[0].clientX;
        if (newWidth < SNAP_CLOSE_THRESHOLD) {
          onClose();
        } else {
          const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth));
          setWidth(clamped);
        }
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');
      setWidth((current) => {
        try {
          localStorage.setItem('notification_panel_width', String(current));
        } catch {
          // Ignore
        }
        return current;
      });
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');
    };
  }, [isDragging, onClose]);

  const startDragging = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    []
  );

  return (
    <>
      {/* Liquid Glass Backdrop (Click outside to close) */}
      <div
        className="notification-backdrop-glass"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Liquid Glass Slide Panel with dynamic resizable width */}
      <div
        className={cn(
          'notification-panel-liquid',
          isDragging && 'notification-is-dragging'
        )}
        id="notification-panel"
        role="dialog"
        aria-label="Notifications Panel"
        style={{ width: `${width}px` }}
      >
        {/* Full-height Clean Draggable Left Resizer Line */}
        <div
          className="notification-resizer-line"
          onMouseDown={startDragging}
          onTouchStart={startDragging}
          title="Drag left/right to resize notifications panel"
        />

        {/* Floating Width Tooltip while dragging */}
        {isDragging && (
          <div className="notification-width-tooltip">
            {`${Math.round(width)}px`}
          </div>
        )}

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

            {/* Clean Close Button (✕) */}
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
