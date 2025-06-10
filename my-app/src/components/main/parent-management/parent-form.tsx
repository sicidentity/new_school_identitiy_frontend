"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
// import { Parent } from "@/types/models";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const parentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email"),
  address: z.string().optional(),
  picture: z
    .instanceof(File)
    .optional()
    .refine(file => !file || file.size <= MAX_FILE_SIZE, "Max image size is 5MB")
    .refine(file => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg, .png, .webp formats are supported"),
});

export type ParentFormValues = z.infer<typeof parentSchema>;

interface ParentFormProps {
  onSubmit: (values: ParentFormValues) => void;
  isSubmitting?: boolean;
}

export function ParentForm({ onSubmit, isSubmitting = false }: ParentFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const inputClassName = "!border-1 !rounded-md focus:outline-none focus:!ring-2 focus:!ring-teal-500 !border-gray-300 !w-full !px-[1rem]"

  

  const handleSubmit = async (values: ParentFormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone);
      formData.append("email", values.email);
      if (values.address) {
        formData.append("address", values.address);
      }
      if (values.picture) {
        formData.append("picture", values.picture);
      }
      // Submit the form data directly to the API endpoint
      const response = await fetch('/api/parents', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to submit parent data');
      }
      const result = await response.json();
      onSubmit(values);
      form.reset();
      setPreviewUrl("");
      return result;
    } catch (error) {
      console.error('Error submitting parent form:', error);
      throw error;
    }
  };

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
          <h2 className="text-lg font-medium">Add New Parent</h2>
          <Button
            type="button"
            className="!bg-[#268094] hover:!bg-teal-700 !rounded-md !py-2 !px-4 !text-white"
            disabled={isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isSubmitting ? "Adding..." : "Add Parent"}
          </Button>
        </div>
        <Separator className="!w-[80%] !my-4" />
        <div className="!mt-6">
          <Form {...form}>
            <div
              id="parent-form"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* // Parent Picture Upload */}
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
                    </FormItem>
                  )}
                />
                {/* // Parent Name Input */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Parent Name" {...field} className={inputClassName} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* // Parent Phone Input */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone Number" {...field} className={inputClassName} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* // Parent Email Input */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} className={inputClassName} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* // Parent Address Input (optional) */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Address" {...field} className={inputClassName} />
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
  );
}
