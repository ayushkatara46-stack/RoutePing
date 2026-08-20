'use client';

// =============================================
// Stop Status Badge
// =============================================

import { STOP_STATE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { StopState } from '@/types';

interface StopStatusBadgeProps {
  state: StopState;
}

export default function StopStatusBadge({ state }: StopStatusBadgeProps) {
  const config = STOP_STATE_CONFIG[state];

  return (
    <span className={cn('stop-status-badge', config.className)}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
