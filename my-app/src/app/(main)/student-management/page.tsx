'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { toast } from 'sonner'
import { StudentForm, StudentFormValues } from "@/components/main/student-management/student-form"
import { DataTable } from "@/components/main/data-table/data-table"
import { createStudentColumns } from "@/components/main/student-management/student-columns"
import { Student, StudentRequest } from "@/types"
import { useRouter } from 'next/navigation'

const { API_URL } = process.env

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`)
  }
  return res.json()
}

export default function StudentsPage() {
  const router = useRouter()

  // Students data
  const { data, error, isLoading } = useSWR<{ 
    success: boolean, 
    data: Student[], 
    count: number 
  }>(API_URL, fetcher)

  // Classes data
  const { data: classesData, error: classError } = useSWR<{ id: string, name: string }[]>(
    '/api/classes', // update this to your real endpoint
    fetcher
  )

  const [isCreating, setIsCreating] = useState(false)

  const handleAddStudent = async (values: StudentFormValues) => {
    setIsCreating(true)
    try {
      if (!API_URL) throw new Error('API_URL is not defined');

      // Convert form values to StudentRequest format
      const formData: StudentRequest = {
        name: values.name,
        age: values.age,
        classId: values.classId,
        parentId: values.parentId,
        picture: values.picture ? URL.createObjectURL(values.picture) : undefined,
        studentInfo: {
          email: values.email,
          phone: values.phone,
        },
        parentInfo: {
          name: 'Parent', // Default value - in a real app you'd get this from the parent selection
          email: values.email, // Using the same email for demo
          phone: values.phone, // Using the same phone for demo
        },
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create student')

      const { data: newStudent } = await response.json()

      mutate(
        API_URL,
        (currentData) => {
          // Create a safe default if currentData is undefined
          const safeData = currentData || { success: true, data: [], count: 0 };
          return {
            success: safeData.success,
            data: [...safeData.data, newStudent],
            count: safeData.count + 1
          };
        },
        false
      );

      toast.success('Student created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create student');
    } finally {
      setIsCreating(false)
    }
  }

  const handleRowClick = (student: Student) => {
    router.push(`attendance/${student.classId}/${student.id}`)
  }

  if (isLoading || !classesData) return (
    <div className="flex items-center justify-center h-screen">
      <div>Loading...</div>
    </div>
  )

  if (error || classError) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-red-500 text-center">
        <p>Failed to load data</p>
        <p>{(error || classError)?.message}</p>
      </div>
    </div>
  )

  return (
    <div className="mx-auto py-6 min-h-screen">
      <StudentForm 
        onSubmit={handleAddStudent} 
        isSubmitting={isCreating}
        classes={classesData} // Pass fetched classes
      />

      <DataTable
        title="Student List"
        columns={createStudentColumns()}
        data={data?.data || []}
        filterColumn="name"
        filterPlaceholder="Filter students..."
        onRowClick={handleRowClick}
      />
    </div>
  )
}
