'use client';

// =============================================
// Child Selector — For parents with multiple children
// =============================================

import { cn } from '@/lib/utils';
import { getInitials, stringToColor } from '@/lib/utils';
import type { StudentWithDetails } from '@/types';
import { STATUS_CONFIG } from '@/lib/constants';

interface ChildSelectorProps {
  students: StudentWithDetails[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ChildSelector({
  students,
  selectedIndex,
  onSelect,
}: ChildSelectorProps) {
  return (
    <div className="child-selector" id="child-selector">
      {students.map((student, index) => {
        const status = student.attendance?.status || 'pending';
        const statusConfig = STATUS_CONFIG[status];

        return (
          <button
            key={student.id}
            className={cn(
              'child-tab',
              index === selectedIndex && 'child-tab-active'
            )}
            onClick={() => onSelect(index)}
          >
            <span
              className="child-avatar"
              style={{ background: stringToColor(student.name) }}
            >
              {getInitials(student.name)}
            </span>
            <div className="child-info">
              <span className="child-name">{student.name}</span>
              <span className="child-class">
                Class {student.class}
                {student.section ? ` - ${student.section}` : ''}
              </span>
            </div>
            <span className={cn('child-status-dot', statusConfig.className)}>
              {statusConfig.icon}
            </span>
          </button>
        );
      })}
    </div>
  );
}
