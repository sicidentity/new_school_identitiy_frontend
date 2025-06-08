'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MultiSelect } from '@/components/ui/multiselect'
import { Skeleton } from '@/components/ui/skeleton'

const classSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
})

export type ClassEditFormValues = z.infer<typeof classSchema>

interface ClassEditFormProps {
  id: string
  onSubmit: () => void
  isSubmitting?: boolean
}

export default function ClassEditForm({
  id,
  onSubmit,
  isSubmitting = false,
}: ClassEditFormProps) {
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const form = useForm<ClassEditFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: { name: '', description: '', studentIds: [] },
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [classRes, studentsRes] = await Promise.all([
          fetch(`/api/classes/${id}?include=students`),
          fetch('/api/students')
        ])
        
        if (!classRes.ok) throw new Error('Failed to fetch class')
        if (!studentsRes.ok) throw new Error('Failed to fetch students')
        
        const cls = await classRes.json()
        const students = await studentsRes.json()
        
        // Get the current student IDs
        const currentStudentIds = cls.data?.students?.map((s: any) => s.id) || []
        
        // Reset form with current values
        form.reset({
          name: cls.data?.name || '',
          description: cls.data?.description || '',
          studentIds: currentStudentIds
        })
        
        // Format students for the multi-select
        const formattedStudents = students.data?.map((s: any) => ({
          label: s.name,
          value: s.id,
          email: s.email
        })) || []
        
        setAllStudents(formattedStudents)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [id])

  const handleForm = form.handleSubmit(async (values) => {
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          // Ensure studentIds is always an array
          studentIds: values.studentIds || []
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update class')
      }
      
      onSubmit()
    } catch (error) {
      console.error('Error updating class:', error)
      throw error // Re-throw to let the form handle the error
    }
  })

  const inputClassName =
    '!border-1 !rounded-md focus:outline-none focus:!ring-2 focus:!ring-teal-500 !border-gray-300 !w-full'

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="!p-8 rounded-lg shadow-md space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Separator className="!w-[80%] !my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <div className="col-span-full">
              <Skeleton className="h-40" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="!p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center !mb-6">
          <h2 className="text-lg font-medium">Edit Class</h2>
          <Button
            type="button"
            className="!bg-teal-600 hover:!bg-teal-700 !rounded-md !py-2 !px-4 !text-white"
            disabled={isSubmitting}
            onClick={handleForm}
          >
            {isSubmitting ? 'Saving...' : 'Save Class'}
          </Button>
        </div>
        <Separator className="!w-[80%] !my-4" />
        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Math 101" className={inputClassName} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional description"
                        className={inputClassName}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-full">
                <FormField
                  control={form.control}
                  name="studentIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Students</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={allStudents}
                          value={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select students..."
                          searchPlaceholder="Search students..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}