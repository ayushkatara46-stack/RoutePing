'use client';

// =============================================
// StatCard Component — Clean Minimalist Metric
// =============================================

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: 'green' | 'red' | 'amber' | 'blue' | 'purple';
  change?: string;
  subtext?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  accent = 'amber',
  change,
  subtext,
  className,
}: StatCardProps) {
  return (
    <div className={cn('stat-card-clean', `stat-accent-${accent}`, className)}>
      <div className="stat-clean-header">
        <span className="stat-clean-label">{label}</span>
        {icon && <div className="stat-clean-icon">{icon}</div>}
      </div>

      <div className="stat-clean-value">{value}</div>

      {(change || subtext) && (
        <div className="stat-clean-footer">
          {change && <span className="stat-clean-badge">{change}</span>}
          {subtext && <span className="stat-clean-subtext">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
