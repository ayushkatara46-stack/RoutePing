'use client';

// =============================================
// Admin Layout — Collapsible Sidebar + Content
// =============================================

import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="app-layout">
      <Navbar />
      <div className={`admin-layout ${collapsed ? 'admin-layout-collapsed' : ''}`}>
        <Sidebar />
        <main className="admin-content">
          <div className="container page-content">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SidebarProvider>
  );
}
