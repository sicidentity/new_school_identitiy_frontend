'use client'
import { DashboardStudent } from "@/types"
import { DataTable } from "@/components/main/data-table/data-table"
import { createStudentColumns } from "@/components/main/attendance/student-columns"
import { useRouter } from "next/navigation";
import { use } from "react";
import useSWR from 'swr';

// Define response interface
interface ClassResponse {
  success: boolean;
  data?: {
    classDetails: {
      id: string;
      name: string;
      description?: string;
    };
    students: DashboardStudent[];
  };
  error?: string;
  timestamp?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function StudentList({params}: {params: Promise<{ classId: string }>}) {
  const router = useRouter();
  const { classId } = use(params);
  
  // Fetch data using SWR
  const { data, error, isLoading } = useSWR<ClassResponse>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/class/${classId}`,
    fetcher
  );
  
  // Use real data from API or fall back to empty array if loading
  const students = data?.data?.students || [];
  // const classDetails = data?.data?.classDetails;
  
  const handleRowClick = (student: DashboardStudent) => {
    const studentClassId = encodeURIComponent(student.class.replace(' ', '%20'));
    const studentId = student.id;
    router.push(`/attendance/${studentClassId}/${studentId}`);
  };
  
  // Create columns with the class ID for proper routing
  const columns = createStudentColumns(classId);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading students...</p>
        </div>
      </div>
    );
  }
  
  if (error || !data?.success) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p>Error loading students: {data?.error || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* {classDetails && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{classDetails.name}</h1>
          {classDetails.description && (
            <p className="text-gray-600 mt-2">{classDetails.description}</p>
          )}
        </div>
      )} */}
      
      <DataTable
        columns={columns}
        data={students}
        filterColumn="name"
        title="Students"
        onRowClick={handleRowClick}
      />
    </div>
  );
}