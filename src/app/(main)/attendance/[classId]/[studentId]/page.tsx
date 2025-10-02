// src/app/(main)/attendance/[classId]/[studentId]/page.tsx

'use client'

import { DataTable } from '@/components/main/data-table/data-table';
import { columns } from '@/components/main/attendance/student-attendance-columns';
import StudentInfoCards from '@/components/main/StudentInfoCards';
import Loader from "@/components/main/Loader";
import { Attendance, TransformedStudent } from '@/types';
import { use } from 'react';
import useSWR from 'swr';

interface PageProps {
  params: Promise<{
    classId: string;
    studentId: string;
  }>;
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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function StudentDetails({ params }: PageProps) {
  const { studentId } = use(params);
  const { data: json, error, isLoading } = useSWR<StudentDetailsResponse>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/student/${studentId}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Loader size="1.5em" />
      </div>
    );
  }

  if (error || !json?.success || !json?.data) {
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
