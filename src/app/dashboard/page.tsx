'use client';

// =============================================
// Parent/Student Dashboard Page
// =============================================

import { useAuthContext } from '@/components/auth/AuthProvider';
import { useAttendance } from '@/hooks/useAttendance';
import { getGreeting } from '@/lib/constants';
import { PageLoader } from '@/components/ui/Spinner';
import TodayBusCard from '@/components/dashboard/TodayBusCard';
import AttendanceToggle from '@/components/dashboard/AttendanceToggle';
import CutoffTimer from '@/components/dashboard/CutoffTimer';
import ChildSelector from '@/components/dashboard/ChildSelector';
import { useState } from 'react';

export default function DashboardPage() {
  const { profile } = useAuthContext();
  const { students, loading, updateAttendance, cutoffTime, isBeforeCutoff } =
    useAttendance();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (loading) return <PageLoader message="Loading your dashboard..." />;

  const selectedStudent = students[selectedIndex] || null;

  return (
    <div className="dashboard-page" id="parent-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            {getGreeting()}, {profile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-secondary">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <CutoffTimer cutoffTime={cutoffTime} />
      </div>

      {/* Child Selector (if multiple) */}
      {students.length > 1 && (
        <ChildSelector
          students={students}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      )}

      {/* Main Content */}
      {selectedStudent ? (
        <div className="dashboard-content">
          <TodayBusCard student={selectedStudent} />

          <AttendanceToggle
            student={selectedStudent}
            isBeforeCutoff={isBeforeCutoff}
            onUpdate={updateAttendance}
          />
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon">📋</span>
          <p className="empty-state-text">No students registered yet</p>
          <p className="text-secondary text-sm">
            Contact your school administrator to add your children
          </p>
        </div>
      )}
    </div>
  );
}
