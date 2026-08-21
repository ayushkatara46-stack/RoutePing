'use client';

// =============================================
// Sidebar Component — Collapsible Slide-bar
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
      {/* Sidebar Header with Slide/Toggle button */}
      <div className="sidebar-header">
        {!collapsed && <h3 className="sidebar-title">Admin Panel</h3>}
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={collapsed ? 'Expand Sidebar (Open)' : 'Collapse Sidebar (Close)'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          id="sidebar-slide-toggle"
        >
          {collapsed ? '▶' : '◀'}
        </button>
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
                isActive && 'sidebar-link-active',
                collapsed && 'sidebar-link-collapsed'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {!collapsed && (
                <span className="sidebar-link-label">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
