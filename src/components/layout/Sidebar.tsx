'use client';

// =============================================
// Sidebar Component — Clean Draggable Resizer
// Sleek Border Resizing without Bulky Arrow Buttons
// =============================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const items = NAV_ITEMS.admin;
  const { width, collapsed, isDragging, startDragging } = useSidebar();

  return (
    <aside
      className={cn(
        'sidebar',
        collapsed && 'sidebar-collapsed',
        isDragging && 'sidebar-is-dragging'
      )}
      id="admin-sidebar"
      aria-label="Admin Navigation"
      style={{ width: `${width}px` }}
    >
      {/* Full-height Clean Draggable Edge Resizer Bar */}
      <div
        className="sidebar-resizer-line"
        onMouseDown={startDragging}
        onTouchStart={startDragging}
        title="Drag left/right to resize sidebar"
      />

      {/* Floating Width Indicator while dragging */}
      {isDragging && (
        <div className="sidebar-width-tooltip">
          {width === 0 ? 'Closed' : `${Math.round(width)}px`}
        </div>
      )}

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
