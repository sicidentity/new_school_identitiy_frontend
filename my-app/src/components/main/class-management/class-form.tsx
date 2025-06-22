'use client';

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
import { MultiSelect } from "@/components/ui/multiselect";
import { Student } from "@/types/models";

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
  students: z.array(z.string()).optional(), // Student IDs
});

export type ClassFormValues = z.infer<typeof classSchema>;

interface ClassFormProps {
  onSubmit: (values: ClassFormValues) => void;
  isSubmitting?: boolean;
  students: Student[];
}

export function ClassForm({ onSubmit, isSubmitting = false, students }: ClassFormProps) {
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      description: '',
      students: [],
    },
  });

  const handleSubmit = async (values: ClassFormValues) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  // Reuse same input styling
  const inputClassName =
    "!border-1 !rounded-md focus:outline-none focus:!ring-2 focus:!ring-teal-500 !border-gray-300 !w-full";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="!p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center !mb-6">
          <h2 className="text-lg font-medium">Add New Class</h2>
          <Button
            type="button"
            className="!bg-teal-600 hover:!bg-teal-700 !rounded-md !py-2 !px-4 !text-white"
            disabled={isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isSubmitting ? "Saving..." : "Save Class"}
          </Button>
        </div>
        <Separator className="!w-[80%] !my-4" />
        <div className="!mt-6">
          <Form {...form}>
            <div>
              <div className="grid !bg-white grid-cols-1 grid-rows-2 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Class Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input className={inputClassName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input className={inputClassName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Student MultiSelect */}
              <FormField
                control={form.control}
              
                name="students"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Students</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={students.map((s) => ({
                          label: s.name,
                          value: String(s.id),
                        }))}
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select students"
                        className="form-select-wrapper"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cancel Button */}
              {/* <div className="flex justify-end">
                <Button type="button" variant="secondary" onClick={() => form.reset()}>
                  Cancel
                </Button>
              </div> */}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
