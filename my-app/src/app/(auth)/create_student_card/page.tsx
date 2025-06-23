'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { FaGraduationCap } from "react-icons/fa6";
import { getStudentById } from '@/lib/actions/student.actions';

const CreateStudentCardPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formSchema = z.object({
    studentId: z.string().min(1, "Student ID is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    event?.preventDefault();
    
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const studentIdNumber = parseInt(data.studentId, 10);

      console.log("Searching for student with ID:", studentIdNumber);
      
      if (isNaN(studentIdNumber)) {
        throw new Error("Please enter a valid student ID number");
      }

      const result = await getStudentById(data.studentId);

      if (result) {
        console.log("Student found:", result);
        setSuccessMessage("Student found!");

        router.push(`/create_student_card/${data.studentId}`);
      } else {
        setErrorMessage("Student not found. Please check the ID and try again.");
      }
    } catch (error: unknown) {
      console.error("Error getting student:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to get student. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="!flex !flex-col !items-center !justify-center !w-[48vw] !h-[95vh]">
      <header className="!flex !flex-col !items-center !w-full !md:!w-[30vw] !mb-6">
        <Image
          src="/images/dot.svg"
          alt="Logo"
          width={50}
          height={50}
          className="!mb-4"
        />
        <h1 className="!text-2xl !text-black !font-bold">Create Student Card</h1>
        <p className="!text-sm !text-[#4a5568] !mt-2 !text-center">Enter student ID to generate student card.</p>
      </header>

      <div className="!w-full !max-w-md !px-4 !md:!px-0 !md:!w-[30vw]">
        {errorMessage && (
          <div className="!bg-red-100 !border-l-4 !border-red-500 !text-red-700 !p-4 !mb-4 !rounded">
            <p>{errorMessage}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="!bg-green-100 !border-l-4 !border-green-500 !text-green-700 !p-4 !mb-4 !rounded">
            <p>{successMessage}</p>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="!space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <label className="!text-sm !text-[#4a5568] !font-semibold !block !mb-1">Student ID</label>
                  <FormControl>
                    <div className="!border !border-[#4a5568] !rounded-sm !w-full !h-11 !flex !flex-row">
                      <div className="!border-r !border-[#4a5568] !h-full !w-11 !flex !items-center !justify-center">
                        <FaGraduationCap className="!text-[#4a5568] !text-xl" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your student ID"
                        className="!w-full !h-full !px-4 !outline-none"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <button 
              type="submit" 
              disabled={isLoading} 
              className="!mt-6 !bg-[#258094] !text-white !font-bold !py-2 !px-4 !rounded-md !w-full !cursor-pointer !disabled:opacity-70"
            >
              {isLoading ? 'Searching...' : 'Create Student Card'}
            </button>
          </form>
        </Form>

        <div className="!w-full !flex !items-center !justify-center !mt-6">
          <Link href="/" className="!text-sm !text-[#4a5568] !font-semibold !hover:underline">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentCardPage;
