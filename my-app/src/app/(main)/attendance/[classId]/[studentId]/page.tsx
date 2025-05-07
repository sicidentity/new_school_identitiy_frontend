// src/app/dashboard/attendance/[classId]/[studentId]/page.tsx

import { DataTable } from '@/components/main/data-table/data-table';
import { columns } from '@/components/main/attendance/student-attendance-columns';
import StudentInfoCards from '@/components/main/StudentInfoCards';
import { Attendance, TransformedStudent } from '@/app/interface/testapi';

interface PageProps {
  params: {
    classId: string;
    studentId: string;
  };
}

// Response type from our Next.js API
interface StudentDetailsResponse {
  success: boolean;
  data?: {
    student: TransformedStudent;
    attendance: Attendance[];
  };
  error?: string;
  timestamp?: string;
}

export default async function StudentDetails({ params }: PageProps) {
  const { studentId } = params;

  // Fetch from your own API route (which talks to backend)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/student/${studentId}`, {
    cache: 'no-store',
  });

  const json: StudentDetailsResponse = await res.json();

  if (!json.success || !json.data) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-red-500 text-center">Failed to load student data.</div>
      </div>
    );
  }

  const { student, attendance } = json.data;

  return (
    <div className="container mx-auto py-10">
      <StudentInfoCards student={student} />
      
      <DataTable
        columns={columns}
        data={attendance}
        filterColumn="date"
        filterPlaceholder="Filter dates..."
        title="Attendance Records"
      />
    </div>
  );
}
