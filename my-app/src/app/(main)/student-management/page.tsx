'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { StudentForm } from "@/components/main/student-management/student-form"
import { DataTable } from "@/components/main/data-table/data-table"
import { createStudentColumns } from "@/components/main/student-management/student-columns"
import { Student, StudentRequest } from "@/app/interface/testapi"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
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

  const handleAddStudent = async (formData: StudentRequest) => {
    setIsCreating(true)
    try {
      if (!API_URL) throw new Error('API_URL is not defined');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create student')

      const { data: newStudent } = await response.json()

      mutate<{ success: boolean, data: Student[], count: number }>(
        API_URL,
        (currentData: { success: boolean, data: Student[], count: number } | undefined) => ({
          ...currentData,
          data: [...(currentData?.data || []), newStudent],
          count: (currentData?.count || 0) + 1,
        }),
        false
      )

      toast({
        title: 'Success',
        description: 'Student created successfully',
        variant: 'default',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create student',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRowClick = (student: Student) => {
    router.push(`attendance/${student.classId}/${student.id}`)
  }

  if (isLoading || !classesData) return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner size="lg" />
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
