'use client';

// =============================================
// Dashboard Layout (Parent/Student)
// =============================================

import Navbar from '@/components/layout/Navbar';
import MobileNav from '@/components/layout/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="container page-content">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
