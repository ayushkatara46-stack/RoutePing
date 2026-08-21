'use client';

// =============================================
// Navbar Component — Warm Honey Ochre Top Bar
// =============================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { ROLE_LABELS, ROLE_DASHBOARDS } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useSidebar } from '@/context/SidebarContext';

const NAV_LINKS = [
  { href: '/admin', label: 'COMMAND' },
  { href: '/admin/attendance', label: 'ATTENDANCE' },
  { href: '/admin/students', label: 'STUDENTS' },
  { href: '/admin/buses', label: 'FLEET' },
  { href: '/admin/routes', label: 'ROUTES' },
  { href: '/admin/settings', label: 'SETTINGS' },
];

export default function Navbar() {
  const { profile, signOut } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();

  if (!profile) return null;

  const homeHref = ROLE_DASHBOARDS[profile.role] || '/';

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Left: Sidebar Toggle + Brand Logo */}
        <div className="flex items-center gap-3">
          {profile.role === 'admin' && (
            <button
              className="navbar-sidebar-toggle"
              onClick={toggleSidebar}
              title={collapsed ? 'Open Admin Panel' : 'Close Admin Panel'}
              aria-label="Toggle Admin Sidebar"
              id="nav-sidebar-toggle-btn"
            >
              <span className="text-base font-bold">{collapsed ? '☰' : '✕'}</span>
            </button>
          )}

          <Link href={homeHref} className="navbar-brand">
            <span className="navbar-logo">🚌</span>
            <div className="navbar-brand-text">
              <span className="navbar-title">ROUTEPING</span>
              <span className="navbar-subtitle">OPERATIONS</span>
            </div>
          </Link>
        </div>

        {/* Center: Top Menu Links (Artisan Style) */}
        {profile.role === 'admin' && (
          <div className="navbar-nav-links hide-mobile">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`navbar-link-item ${isActive ? 'navbar-link-active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right: Actions */}
        <div className="navbar-actions">
          <NotificationBell />

          {/* User menu */}
          <div className="user-menu-wrapper">
            <button
              className="user-menu-trigger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              id="user-menu-button"
            >
              <span className="avatar avatar-sm user-avatar-honey">
                {getInitials(profile.name)}
              </span>
              <span className="user-menu-name hide-mobile">
                {profile.name}
              </span>
              <span className="text-xs">▾</span>
            </button>

            {menuOpen && (
              <>
                <div
                  className="user-menu-backdrop"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="user-menu-dropdown" role="menu">
                  <div className="user-menu-header">
                    <span className="font-bold text-primary">{profile.name}</span>
                    <span className="text-xs text-secondary">
                      {ROLE_LABELS[profile.role]}
                    </span>
                  </div>
                  <div className="user-menu-divider" />
                  <button
                    className="user-menu-item"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    role="menuitem"
                    id="sign-out-button"
                  >
                    <span>🚪</span>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
