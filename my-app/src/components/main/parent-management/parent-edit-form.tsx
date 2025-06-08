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
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { MultiSelect } from '@/components/ui/multiselect'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const parentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email'),
  address: z.string().min(1, 'Address is required'),
  studentIds: z.array(z.string()).optional(),
  picture: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, 'Max image size is 5MB')
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .png, .webp formats are supported'
    ),
})

export type ParentEditFormValues = z.infer<typeof parentSchema>

interface ParentEditFormProps {
  id: string
  onSubmit: () => void
  isSubmitting?: boolean
}

export default function ParentEditForm({
  id,
  onSubmit,
  isSubmitting = false,
}: ParentEditFormProps) {
  
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [allStudents, setAllStudents] = useState<Array<{ label: string; value: string }>>([])
  const form = useForm<ParentEditFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: { 
      name: '', 
      phone: '', 
      email: '', 
      address: '',
      studentIds: []
    },
  })
  

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        
        // Fetch parent data with students included and all students in parallel
        const [parentRes, studentsRes] = await Promise.all([
          fetch(`/api/parents/${id}?include=students`),
          fetch('/api/students')
        ])
        
        if (!parentRes.ok) throw new Error('Failed to fetch parent')
        if (!studentsRes.ok) throw new Error('Failed to fetch students')
        
        const parentResult = await parentRes.json()
        const studentsResult = await studentsRes.json()
        
        // Handle the API response structure - check multiple levels
        let parentData
        if (parentResult.data?.parent) {
          parentData = parentResult.data.parent
        } else if (parentResult.data) {
          parentData = parentResult.data
        } else {
          parentData = parentResult
        }
        
        const students = studentsResult.data || studentsResult
        
        // Format students for the multi-select FIRST
        const formattedStudents = students.map((s: any) => ({
          label: s.name,
          value: s.id,
          email: s.email
        })) || []
        
        setAllStudents(formattedStudents)
        
        // Get the current student IDs from the parent's students array
        const currentStudentIds = parentData.students?.map((s: any) => s.id) || []
        // Reset the entire form with the fetched data
        form.reset({
          name: parentData.name || '',
          phone: parentData.phone || '',
          email: parentData.email || '',
          address: parentData.address || '',
          studentIds: currentStudentIds,
          picture: undefined // Don't set the existing file, just show preview
        })
        
        // Set the preview URL if a picture exists
        if (parentData.picture) {
          setPreviewUrl(parentData.picture)
        } else if (parentData.b2FileId && parentData.b2FileName) {
          setPreviewUrl(`/api/parents/${id}/picture`)
        }
        
      } catch (error) {
        console.error('Error loading parent:', error)
        // You might want to show a toast or error message here
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, form])

  const handleForm = form.handleSubmit(async (values) => {
    try {
      const data = new FormData()

      // Append all form values to FormData
      Object.entries(values).forEach(([key, val]) => {
        if (key === 'picture' && val instanceof File) {
          data.append(key, val)
        } else if (key === 'studentIds' && Array.isArray(val)) {
          // Handle array values properly for FormData
          val.forEach((id) => {
            data.append('studentIds[]', id)
          })
        } else if (val !== undefined && val !== null) {
          data.append(key, String(val))
        }
      })

      const res = await fetch(`/api/parents/${id}`, {
        method: 'PATCH', // Changed from PUT to PATCH to match the backend
        body: data,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update parent')
      }

      onSubmit()
    } catch (error) {
      console.error('Error updating parent:', error)
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
            <div className="col-span-full flex gap-4 items-center">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="h-10 flex-grow" />
            </div>
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
      </div>
    )
  }

  // Handle student selection change
  const handleStudentChange = (selectedIds: string[]) => {
    form.setValue('studentIds', selectedIds, { shouldValidate: true })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="!p-8 rounded-lg shadow-md">
        {/* Debug section - remove this once working */}
        
        
        <div className="flex justify-between items-center !mb-6">
          <h2 className="text-lg font-medium">Edit Parent</h2>
          <Button
            type="button"
            className="!bg-teal-600 hover:!bg-teal-700 !rounded-md !py-2 !px-4 !text-white"
            disabled={isSubmitting}
            onClick={handleForm}
          >
            {isSubmitting ? 'Saving...' : 'Save Parent'}
          </Button>
        </div>
        <Separator className="!w-[80%] !my-4" />
        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Picture */}
              <FormField
                control={form.control}
                name="picture"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Parent Picture</FormLabel>
                    <div className="flex items-center gap-4">
                      {previewUrl && (
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          width={80}
                          height={80}
                          className="rounded-full object-cover border"
                        />
                      )}
                      <div className="flex flex-col">
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            className={inputClassName}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                field.onChange(file)
                                const reader = new FileReader()
                                reader.onload = () => setPreviewUrl(reader.result as string)
                                reader.readAsDataURL(file)
                              } else {
                                field.onChange(undefined)
                                setPreviewUrl('')
                              }
                            }}
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500 mt-1">
                          Max 5MB. JPG, PNG, or WEBP.
                        </p>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" className={inputClassName} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" className={inputClassName} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="jane@example.com" className={inputClassName} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="456 Elm St" className={inputClassName} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Students Multi-Select */}
              <div className="col-span-full">
                <FormField
                  control={form.control}
                  name="studentIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associated Students</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={allStudents}
                          value={field.value || []}
                          onChange={handleStudentChange}
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