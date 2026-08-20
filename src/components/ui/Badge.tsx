'use client';

// =============================================
// Badge Component
// =============================================

import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'green' | 'red' | 'amber' | 'blue' | 'purple';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  children: ReactNode;
}

export default function Badge({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        `badge-${variant}`,
        size === 'sm' && 'badge-sm',
        className
      )}
      {...props}
    >
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
}
