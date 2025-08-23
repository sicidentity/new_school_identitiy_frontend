'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { ClassForm, ClassFormValues } from '@/components/main/class-management/class-form';
import { DataTable } from '@/components/main/data-table/data-table';
import { createClassColumns } from '@/components/main/class-management/class-columns';
import { Class, Student } from '@/types/models';
import { useRouter } from 'next/navigation';


const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
};

export default function ClassManagementPage() {
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, error } = useSWR<Class[]>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/classes`, fetcher, {
    onSuccess: (data) => {
      console.log('Classes API Response:', data);
      if (data) {
        console.log('Classes data structure:', {
          firstItem: data[0],
          hasStudents: data[0]?.students ? 'Yes' : 'No',
          studentsType: Array.isArray(data[0]?.students) ? 'Array' : typeof data[0]?.students,
          keys: data[0] ? Object.keys(data[0]) : 'No data'
        });
      }
    },
    onError: (err) => {
      console.error('Error fetching classes:', err);
    }
  });

  const { data: studentsResponse, error: studentsError } = useSWR<{
    success: boolean;
    data: Student[];
    count: number;
  }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/students`, fetcher);

  const handleAddClass = async (formData: ClassFormValues) => {
    setFormErrors(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await mutate(`${process.env.NEXT_PUBLIC_BASE_URL}/api/classes`);
        toast.success('Class created successfully');
        setIsSubmitting(false);
      } else {
        const result = await response.json();
        const message = result?.message || 'Failed to create class';
        setFormErrors(message);
        toast.error(message);
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: unknown }).message === 'string'
          ? (err as { message: string }).message
          : 'Failed to create class';

      setFormErrors(message);
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  const handleRowClick = (class_: Class) => {
    router.push(`/app/(main)/attendance/${class_.id}`);
  };

  const classesData = data || [];
  const allStudents = studentsResponse?.data || [];

  // Debug logs
  console.log('Classes API Response:', { data, error });
  console.log('Classes Data dtaa:', data);
  console.log('Classes Data:dddddd', classesData);

  console.log('Students API Response:', { studentsResponse, studentsError });

  return (
    <div className="space-y-8">
     

      {formErrors && (
        <div className="text-red-500 mb-4">
          <strong>Error:</strong> {formErrors}
        </div>
      )}

      <div className="space-y-6">
        <ClassForm 
          onSubmit={handleAddClass} 
          students={allStudents} 
          isSubmitting={isSubmitting} 
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Class List</h2>
        
        <DataTable
          columns={createClassColumns(handleRowClick)}
          data={classesData}
          filterColumn="name"
          filterPlaceholder="Filter classes..."
        />
      </div>
    </div>
  );
}
