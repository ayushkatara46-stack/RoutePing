'use client';

// =============================================
// useRealtime Hook — Supabase Realtime
// =============================================

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onPayload: (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => void;
  enabled?: boolean;
}

export function useRealtime({
  table,
  schema = 'public',
  event = '*',
  filter,
  onPayload,
  enabled = true,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onPayloadRef = useRef(onPayload);
  onPayloadRef.current = onPayload;

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      const supabase = createClient();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    const supabase = createClient();
    const channelName = `realtime-${table}-${event}-${filter || 'all'}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          onPayloadRef.current(payload as { new: Record<string, unknown>; old: Record<string, unknown> });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return cleanup;
  }, [table, schema, event, filter, enabled, cleanup]);
}

export default useRealtime;
