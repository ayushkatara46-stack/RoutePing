'use client';

// =============================================
// Attendance History Page
// =============================================

import { useState } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { PageLoader } from '@/components/ui/Spinner';
import ChildSelector from '@/components/dashboard/ChildSelector';
import AttendanceHistory from '@/components/dashboard/AttendanceHistory';

export default function HistoryPage() {
  const { students, loading } = useAttendance();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (loading) return <PageLoader message="Loading history..." />;

  const selectedStudent = students[selectedIndex];

  return (
    <div className="history-page" id="history-page">
      <h1 className="mb-6">Attendance History</h1>

      {students.length > 1 && (
        <ChildSelector
          students={students}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      )}

      {selectedStudent ? (
        <AttendanceHistory studentId={selectedStudent.id} />
      ) : (
        <div className="empty-state">
          <p className="empty-state-text">No students found</p>
        </div>
      )}
    </div>
  );
}
