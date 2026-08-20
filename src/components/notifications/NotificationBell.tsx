'use client';

// =============================================
// Notification Bell Component
// =============================================

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import type { Notification } from '@/types';

export default function NotificationBell() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    };

    fetchNotifications();

    // Listen for new notifications in realtime
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="notification-bell-wrapper">
      <button
        className="notification-bell"
        onClick={() => setPanelOpen(!panelOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        id="notification-bell"
      >
        <span className="notification-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {panelOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setPanelOpen(false)}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllRead}
        />
      )}
    </div>
  );
}
