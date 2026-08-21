import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { SidebarProvider } from '@/context/SidebarContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'RoutePing — School Bus Attendance & Route System',
  description:
    'Confirm daily bus attendance, view optimized routes, and manage school bus operations in real time.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#e08714',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          <ToastProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
