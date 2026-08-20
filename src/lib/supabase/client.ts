// =============================================
// Browser Supabase Client (Singleton)
// Uses @supabase/ssr for cookie-based auth
// =============================================

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function createClient() {
  if (typeof window !== 'undefined' && client) {
    return client;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const newClient = createBrowserClient(url, anonKey);

  if (typeof window !== 'undefined') {
    client = newClient;
  }

  return newClient;
}
