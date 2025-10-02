'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { ParentForm } from '@/components/main/parent-management/parent-form';
import { DataTable } from '@/components/main/data-table/data-table';
import { createParentColumns } from '@/components/main/parent-management/parent-columns';
import { Parent } from '@/types/models';
// import { ClassForm } from '@/components/main/class-management/class-form';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
};

export default function ParentManagementPage() {
  // Parents data
  const { data } = useSWR<{
    success: boolean;
    data: Parent[];
    count: number;
  }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/parents`, fetcher);

  const [isCreating, setIsCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<string | null>(null);

  // Remove unused formData parameter to fix lint error
  const handleAddParent = async () => {
    setIsCreating(true);
    setFormErrors(null);
    try {
      await mutate(`${process.env.NEXT_PUBLIC_BASE_URL}/api/parents`);
      toast.success('Parent created successfully');
    } catch (err: unknown) {
      if (
  err &&
  typeof err === 'object' &&
  err !== null &&
  'message' in err &&
  typeof (err as { message?: unknown }).message === 'string'
) {
  setFormErrors((err as { message: string }).message);
      } else {
        setFormErrors('Failed to create parent');
      }
      toast.error('Failed to create parent');
    } finally {
      setIsCreating(false);
    }
  };

  const parentsData = data?.data || [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Parent Management</h1>
      {formErrors && (
        <div className="text-red-500 mb-4">
          <strong>Error:</strong> {formErrors}
        </div>
      )}
      {/* <ClassForm onSubmit={handleAddParent} isSubmitting={isCreating} /> */}
      <ParentForm onSubmit={handleAddParent} isSubmitting={isCreating} />
      <DataTable
        title="Parent List"
        columns={createParentColumns()}
        data={parentsData}
        filterColumn="name"
        filterPlaceholder="Filter parents..."
      />
    </div>
  );
}
