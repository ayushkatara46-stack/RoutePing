'use client';

// =============================================
// Driver Layout
// =============================================

import Navbar from '@/components/layout/Navbar';

export default function DriverLayout({
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
    </div>
  );
}
