'use client';

// =============================================
// Navbar Component
// =============================================

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { ROLE_LABELS, ROLE_DASHBOARDS } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function Navbar() {
  const { profile, signOut } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!profile) return null;

  const homeHref = ROLE_DASHBOARDS[profile.role] || '/';

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Left: Logo + App Name */}
        <Link href={homeHref} className="navbar-brand">
          <span className="navbar-logo">🚌</span>
          <span className="navbar-title">BusTrack</span>
        </Link>

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
              <span
                className="avatar avatar-sm"
                style={{
                  background: `hsl(${profile.name.length * 30}, 65%, 55%)`,
                }}
              >
                {getInitials(profile.name)}
              </span>
              <span className="user-menu-name hide-mobile">
                {profile.name}
              </span>
            </button>

            {menuOpen && (
              <>
                <div
                  className="user-menu-backdrop"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="user-menu-dropdown" role="menu">
                  <div className="user-menu-header">
                    <span className="font-semibold">{profile.name}</span>
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
