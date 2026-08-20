'use client';

// =============================================
// Root Page — Redirect to role dashboard or login
// =============================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { ROLE_DASHBOARDS } from '@/lib/constants';
import { PageLoader } from '@/components/ui/Spinner';

export default function HomePage() {
  const { profile, loading, user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (profile) {
        const dashboard = ROLE_DASHBOARDS[profile.role] || '/admin';
        router.replace(dashboard);
      } else if (!user) {
        router.replace('/login');
      }
    }
  }, [profile, user, loading, router]);

  return <PageLoader message="Loading your dashboard..." />;
}
