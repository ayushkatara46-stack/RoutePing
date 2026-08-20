'use client';

// =============================================
// Spinner Component
// =============================================

import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export default function Spinner({
  size = 'md',
  className,
  label = 'Loading...',
}: SpinnerProps) {
  return (
    <div className={cn('spinner-wrapper', className)} role="status">
      <div className={cn('spinner', `spinner-${size}`)} />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="page-loader">
      <div className="spinner spinner-lg" />
      {message && <p className="text-secondary mt-4">{message}</p>}
    </div>
  );
}
