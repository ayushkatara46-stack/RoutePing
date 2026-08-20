'use client';

// =============================================
// StatCard Component
// =============================================

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: 'green' | 'red' | 'amber' | 'blue' | 'purple';
  change?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  accent = 'purple',
  change,
  className,
}: StatCardProps) {
  const accentVarMap: Record<string, string> = {
    green: 'var(--accent-green)',
    red: 'var(--accent-red)',
    amber: 'var(--accent-amber)',
    blue: 'var(--accent-blue)',
    purple: 'var(--accent-primary)',
  };

  return (
    <div
      className={cn('stat-card', className)}
      style={{ '--stat-accent': accentVarMap[accent] } as React.CSSProperties}
    >
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {change && <span className="stat-change">{change}</span>}
    </div>
  );
}
