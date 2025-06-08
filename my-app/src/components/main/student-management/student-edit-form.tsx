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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'
import type { Class, Parent } from '@/types/models'
import { Skeleton } from '@/components/ui/skeleton'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const studentSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    age: z
      .number({ invalid_type_error: 'Age is required' })
      .min(5, 'Minimum age is 5')
      .max(25, 'Maximum age is 25'),
    classId: z.string().min(1, 'Class selection is required'),
    parentId: z.string().min(1, 'Parent selection is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    address: z.string().min(1, 'Address is required'),
    regNumber: z.string().min(1, 'Registration number is required'),
    admissionDate: z.string().min(1, 'Admission date is required'),
    picture: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= MAX_FILE_SIZE, 'Max image size is 5MB')
      .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
        'Only .jpg, .png, .webp formats are supported'
      ),
  })

export type StudentEditFormValues = z.infer<typeof studentSchema>

interface StudentEditFormProps {
  id: string
  onSubmit: () => void
  isSubmitting?: boolean
}

export default function StudentEditForm({
  id,
  onSubmit,
  isSubmitting = false,
}: StudentEditFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [classes, setClasses] = useState<Class[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<StudentEditFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      age: 0,
      classId: '',
      parentId: '',
      email: '',
      phone: '',
      address: '',
      admissionDate: '',
    },
  })

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      fetch(`/api/students/${id}`).then(r => {
        if (!r.ok) throw new Error('Failed to fetch student')
        return r.json()
      }),
      fetch('/api/classes').then(r => {
        if (!r.ok) throw new Error('Failed to fetch classes')
        return r.json()
      }),
      fetch('/api/parents').then(async r => {
        if (!r.ok) throw new Error('Failed to fetch parents')
        const response = await r.json()
        return response.data || [] // Ensure we always return an array
      }),
    ]).then(([studentResponse, clsList, parentList]) => {
      // Extract the student data from the response
      const studentData = studentResponse.data || studentResponse;
      
      // Format the form values
      const formValues = {
        name: studentData.name || '',
        age: studentData.age || 0,
        classId: studentData.classId || '',
        parentId: studentData.parentId || '',
        email: studentData.email || '',
        phone: studentData.phone || '',
        address: studentData.address || '',
        regNumber: studentData.regNumber || '',
        admissionDate: studentData.admissionDate
          ? new Date(studentData.admissionDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        picture: undefined, // Handle file separately
      };
      
      // Reset the form with the student's data
      form.reset(formValues);
      
      // Set the preview image if it exists
      if (studentData.picture) {
        setPreviewUrl(studentData.picture);
      }
      
      // Set the classes and parents lists
      setClasses(Array.isArray(clsList) ? clsList : []);
      setParents(Array.isArray(parentList) ? parentList : []);
    }).catch(console.error)
    .finally(() => setIsLoading(false))
  }, [id])

  const handleForm = form.handleSubmit(async (values) => {
    const data = new FormData()
    Object.entries(values).forEach(([key, val]) => {
      if (key === 'picture' && val instanceof File) {
        data.append(key, val)
      } else if (val !== undefined) {
        data.append(key, String(val))
      }
    })
    const res = await fetch(`/api/students/${id}`, {
      method: 'PATCH',
      body: data,
    })
    if (!res.ok) throw new Error('Failed to update student')
    onSubmit()
  })

  const inputClassName =
    '!border-1 !rounded-md focus:outline-none focus:!ring-2 focus:!ring-teal-500 !border-gray-300 !w-full'
  const selectTriggerClassName = `${inputClassName} !bg-white !text-gray-900 !w-full`

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
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="!p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center !mb-6">
          <h2 className="text-lg font-medium">Edit Student</h2>
          <Button
            type="button"
            className="!bg-teal-600 hover:!bg-teal-700 !rounded-md !py-2 !px-4 !text-white"
            disabled={isSubmitting}
            onClick={handleForm}
          >
            {isSubmitting ? 'Saving...' : 'Save Student'}
          </Button>
        </div>
        <Separator className="!w-[80%] !my-4" />
        <Form {...form}>
          <div id="student-form" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Picture */}
              <FormField
                control={form.control}
                name="picture"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Student Picture</FormLabel>
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
                      <FormControl>
                        <div>
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
                          <p className="text-xs text-gray-500 mt-1">
                            Max 5MB. JPG, PNG, or WEBP.
                          </p>
                        </div>
                      </FormControl>
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
                    <FormLabel>Student Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className={inputClassName} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reg Number */}
              <FormField
                control={form.control}
                name="regNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567" className={inputClassName} {...field} />
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
                      <Input placeholder="123 Main St" className={inputClassName} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admission Date */}
              <FormField
                control={form.control}
                name="admissionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Date</FormLabel>
                    <FormControl>
                      <Input type="date" className={inputClassName} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Age */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className={inputClassName}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Class */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent */}
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="Select a parent" />
                        </SelectTrigger>
                        <SelectContent>
                          {parents.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Input
                        placeholder="john@example.com"
                        className={inputClassName}
                        {...field}
                      />
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
                      <Input
                        placeholder="+1234567890"
                        className={inputClassName}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}