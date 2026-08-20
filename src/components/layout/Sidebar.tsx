'use client';

// =============================================
// Sidebar Component (Admin Layout)
// =============================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const items = NAV_ITEMS.admin;

  return (
    <aside className="sidebar" id="admin-sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Admin Panel</h3>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', isActive && 'sidebar-link-active')}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
