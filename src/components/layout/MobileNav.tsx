'use client';

// =============================================
// Mobile Bottom Navigation
// =============================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

export default function MobileNav() {
  const pathname = usePathname();
  const { role } = useAuthContext();

  if (!role) return null;

  const items = NAV_ITEMS[role as keyof typeof NAV_ITEMS] || [];

  return (
    <nav className="mobile-nav" id="mobile-nav">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'mobile-nav-item',
              isActive && 'mobile-nav-item-active'
            )}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
