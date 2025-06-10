'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
import { IoMail } from "react-icons/io5";
import { ForgotPassword } from '@/lib/actions/user.actions';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await ForgotPassword(data.email);

      if (result) {
        setSuccessMessage("Password reset instructions have been sent to your email.");
        localStorage.setItem('userEmail', data.email);
        form.reset();
      }
    } catch (error: unknown) {
      console.error("Error during password reset request:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to send reset instructions. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="!flex !flex-col !items-center !justify-center !w-full !md:!w-[48vw] !h-[95vh]">
        <header className="!flex !flex-col !items-center !w-full !md:!w-[30vw] !mb-6">
          <Image
            src="/images/password.svg"
            alt="Logo"
            width={50}
            height={50}
            className="!mb-4"
          />
          <h1 className="!text-2xl !text-black !font-bold">Forgot password?</h1>
          <p className="!text-sm !text-[#4a5568] !mt-2 !text-center">No worries, we&apos;ll send reset instructions</p>
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
          
          <div className="!flex !flex-col !gap-4 !mt-4 !w-full">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <label className="!text-sm !text-[#4a5568] !font-semibold !block !mb-1">Email</label>
                  <FormControl>
                    <div className="!border !border-[#4a5568] !rounded-sm !w-full !h-11 !flex !flex-row">
                      <div className="!border-r !border-[#4a5568] !h-full !w-11 !flex !items-center !justify-center">
                        <IoMail className="!text-[#4a5568] !text-xl" />
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="!w-full !h-full !px-4 !outline-none"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className="!mt-6 !bg-[#258094] !text-white !font-bold !py-2 !px-4 !rounded-md !w-full !cursor-pointer !disabled:opacity-70"
          >
            {isLoading ? 'Sending...' : 'Reset Password'}
          </button>

          <div className="!w-full !flex !items-center !justify-center !mt-6">
            <Link href="/login" className="!text-sm !text-[#4a5568] !font-semibold !hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ForgotPasswordPage;
