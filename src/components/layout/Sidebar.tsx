'use client';

// =============================================
// Sidebar Component — Collapsible Slide-bar
// With Edge Floating Handle (where circled by user)
// =============================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const items = NAV_ITEMS.admin;
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn('sidebar', collapsed && 'sidebar-collapsed')}
      id="admin-sidebar"
      aria-label="Admin Navigation"
    >
      {/* Floating Edge Slide Handle (Exactly on the middle border where circled) */}
      <button
        className="sidebar-edge-handle"
        onClick={toggleSidebar}
        title={collapsed ? 'Slide Open Admin Panel (▶)' : 'Slide Close Admin Panel (◀)'}
        aria-label={collapsed ? 'Slide Open Admin Panel' : 'Slide Close Admin Panel'}
        id="sidebar-edge-slide-btn"
      >
        <span>{collapsed ? '▶' : '◀'}</span>
      </button>

      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h3 className="sidebar-title">Admin Panel</h3>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'sidebar-link',
                isActive && 'sidebar-link-active'
              )}
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
