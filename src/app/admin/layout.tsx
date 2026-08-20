'use client';

// =============================================
// Admin Layout — Sidebar + Content
// =============================================

import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-content">
          <div className="container page-content">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
