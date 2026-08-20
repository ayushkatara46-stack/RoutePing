'use client';

// =============================================
// Root Page — Redirect to role dashboard
// =============================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { ROLE_DASHBOARDS } from '@/lib/constants';
import { PageLoader } from '@/components/ui/Spinner';

export default function HomePage() {
  const { profile, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) {
      const dashboard = ROLE_DASHBOARDS[profile.role] || '/dashboard';
      router.replace(dashboard);
    }
  }, [profile, loading, router]);

  return <PageLoader message="Loading your dashboard..." />;
}
