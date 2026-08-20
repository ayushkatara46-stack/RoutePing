'use client';

// =============================================
// useAuth Hook — Convenience wrapper
// =============================================

import { useAuthContext } from '@/components/auth/AuthProvider';

export function useAuth() {
  return useAuthContext();
}

export default useAuth;
