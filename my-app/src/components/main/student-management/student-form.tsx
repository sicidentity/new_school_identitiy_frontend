'use client'

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'
import { Parent } from '@/types/models'

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Schema definition
const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(5, "Minimum age is 5").max(25, "Maximum age is 25"),
  classId: z.string().min(1, "Class selection is required"),
  parentId: z.string().min(1, "Parent selection is required"),
  email: z.string().email("Invalid email"),
  // parentEmail: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  // parentPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
  admissionDate: z.string().optional(),
  picture: z
    .instanceof(File)
    .optional()
    .refine(file => !file || file.size <= MAX_FILE_SIZE, 'Max image size is 5MB')
    .refine(file => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), 'Only .jpg, .png, .webp formats are supported')
})

export type StudentFormValues = z.infer<typeof studentSchema>

interface StudentFormProps {
  onSubmit: (values: StudentFormValues) => void
  isSubmitting?: boolean
  classes: { id: string; name: string }[]
  parents?: Parent[] 
}

export function StudentForm({ onSubmit, isSubmitting = false, classes, parents = [] }: StudentFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const form = useForm<StudentFormValues>({
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

  const handleSubmit = async (values: StudentFormValues) => {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add all form fields to FormData
      formData.append('name', values.name);
      formData.append('age', values.age.toString());
      formData.append('classId', values.classId);
      formData.append('parentId', values.parentId);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      
      // Add optional fields if they exist
      if (values.address) {
        formData.append('address', values.address);
      }
      
      if (values.admissionDate) {
        formData.append('admissionDate', values.admissionDate);
      }
      
      // Add picture if it exists
      if (values.picture) {
        formData.append('picture', values.picture);
      }
      
      // Submit the form data directly to the API endpoint
      const response = await fetch('/api/students', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit student data');
      }
      
      const result = await response.json();
      
      // Call the original onSubmit with the result
      onSubmit(values);

      // Reset the form and clear preview after success
      form.reset();
      setPreviewUrl("");
      
      return result;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  }

  // Consistent styling
  const inputClassName = "!border-1 !rounded-md focus:outline-none focus:!ring-2 focus:!ring-teal-500 !border-gray-300 !w-full"
  const selectTriggerClassName = `${inputClassName} !bg-white !text-gray-900 !w-full`

  // Custom styles are applied via className props directly

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <style jsx global>{`
        .select-container {
          width: 100%;
        }
        .select-container [data-slot="select-trigger"] {
          width: 100% !important;
        }
      `}</style>
      <div className="!p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center !mb-6">
          <h2 className="text-lg font-medium">Add New Student</h2>
          <Button
            type="button"
            className="!bg-teal-600 hover:!bg-teal-700 !rounded-md !py-2 !px-4 !text-white"
            disabled={isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isSubmitting ? "Adding..." : "Add Student"}
          </Button>
        </div>
        <Separator className="!w-[80%] !my-4" />
        <div className="!mt-6">
          <Form {...form}>
            <div
              id="student-form"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Picture Upload */}
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
                          <div className="flex flex-col gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              className={inputClassName}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  field.onChange(file)
                                  const reader = new FileReader()
                                  reader.onload = () => {
                                    setPreviewUrl(reader.result as string)
                                  }
                                  reader.readAsDataURL(file)
                                } else {
                                  field.onChange(undefined)
                                  setPreviewUrl("")
                                }
                              }}
                            />
                            <p className="text-xs text-gray-500">
                              Max 5MB. JPG, PNG, or WEBP.
                            </p>
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name</FormLabel>
                      <FormControl>
                        <Input
                          className={inputClassName}
                          placeholder="John Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address Field */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          className={inputClassName}
                          placeholder="123 Main St"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Admission Date Field */}
                <FormField
                  control={form.control}
                  name="admissionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className={inputClassName}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                {/* Age Field */}
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
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Class Selection */}
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem className="!w-full">
                      <FormLabel>Class</FormLabel>
                      <div className="form-select-wrapper">
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                        <FormControl>
                          <SelectTrigger className={selectTriggerClassName}>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map(cls => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parent Selection */}
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent</FormLabel>
                      <div className="form-select-wrapper">
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                        <FormControl>
                          <SelectTrigger className={selectTriggerClassName}>
                            <SelectValue placeholder="Select a parent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {parents.map(parent => (
                            <SelectItem key={parent.id} value={parent.id}>
                              {parent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parent Phone Number Field */}
                {/* <FormField
                  control={form.control}
                  name="parentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          className={inputClassName}
                          placeholder="+1234567890"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* Parent Email Field */}
                {/* <FormField
                  control={form.control}
                  name="parentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Email</FormLabel>
                      <FormControl>
                        <Input
                          className={inputClassName}
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}


                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          className={inputClassName}
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          className={inputClassName}
                          placeholder="+1234567890"
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
    </div>
  )
}