'use client';

// =============================================
// StatCard Component — Holographic Glowing Card
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
  accent = 'purple',
  change,
  subtext,
  className,
}: StatCardProps) {
  const accentVarMap: Record<string, string> = {
    green: 'var(--accent-green)',
    red: 'var(--accent-red)',
    amber: 'var(--accent-amber)',
    blue: 'var(--accent-blue)',
    purple: 'var(--accent-primary)',
  };

  const accentGlowMap: Record<string, string> = {
    green: 'var(--accent-green-dim)',
    red: 'var(--accent-red-dim)',
    amber: 'var(--accent-amber-dim)',
    blue: 'var(--accent-blue-dim)',
    purple: 'var(--accent-primary-dim)',
  };

  return (
    <div
      className={cn('stat-card', `stat-card-${accent}`, className)}
      style={
        {
          '--stat-accent': accentVarMap[accent],
          '--stat-glow': accentGlowMap[accent],
        } as React.CSSProperties
      }
    >
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        {icon && <div className="stat-icon-wrapper">{icon}</div>}
      </div>
      <div className="stat-value">{value}</div>
      {(change || subtext) && (
        <div className="stat-card-footer">
          {change && <span className="stat-change-pill">{change}</span>}
          {subtext && <span className="stat-subtext">{subtext}</span>}
        </div>
      )}
      <div className="stat-card-accent-bar" />
    </div>
  );
}
