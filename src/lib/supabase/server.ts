// =============================================
// Server Supabase Client
// For Server Components, API routes, middleware
// =============================================

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://wmdwqsbdfarfrcdclzye.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_5xsTsNXERPe34frh0aS2pA_ljKR6ZqL';

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Ignored in Server Components (read-only)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Ignored in Server Components (read-only)
          }
        },
      },
    }
  );
}

/**
 * Service role client for admin operations that bypass RLS
 */
export function createServiceRoleClient() {
  const { createClient } = require('@supabase/supabase-js');
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://wmdwqsbdfarfrcdclzye.supabase.co';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZHdxc2JkZmFyZnJjZGNsenllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzExNzAwMSwiZXhwIjoyMTAyNjkzMDAxfQ.XQX7G1R90anpdts-8uAGqO4musAUp4CBRoia4kHcfyg';

  return createClient(
    url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
