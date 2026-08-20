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

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://wmdwqsbdfarfrcdclzye.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_5xsTsNXERPe34frh0aS2pA_ljKR6ZqL';

  const newClient = createBrowserClient(url, anonKey);

  if (typeof window !== 'undefined') {
    client = newClient;
  }

  return newClient;
}
