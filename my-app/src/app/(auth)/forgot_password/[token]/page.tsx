'use client';

import React, { useState, useEffect } from 'react';
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
import { FaLock } from "react-icons/fa6";
import { ResetPassword } from '@/lib/actions/user.actions';

const ResetPasswordPage = ({ params }: { params: Promise<ParamProps['params']> }) => {
  const { token } = React.use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formSchema = z.object({
    password: z.string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
      .min(8, "Password must be at least 8 characters"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setErrorMessage("No reset token provided. Please use the link from your email.");
    }
  }, [token]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!token) {
      setErrorMessage("No reset token provided. Please use the link from your email.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await ResetPassword(data.password, token);

      if (result) {
        setSuccessMessage("Your password has been successfully reset.");
        form.reset();

        setTimeout(() => {
          router.push("/forgot_password/done");
        }, 3000);
      }
    } catch (error: unknown) {
      console.error("Error during password reset:", error);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center justify-center w-full md:w-[48vw] h-[95vh]">
        <header className="flex flex-col items-center w-full md:w-[30vw] mb-6">
          <Image
            src="/images/dot.svg"
            alt="Logo"
            width={50}
            height={50}
            className="mb-4"
          />
          <h1 className="text-2xl text-black font-bold">Set new password</h1>
          <p className="text-sm text-[#4a5568] mt-2 text-center">Must be at least 8 characters.</p>
        </header>

        <div className="w-full max-w-md px-4 md:px-0 md:w-[30vw]">
          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{errorMessage}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
              <p>{successMessage}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-4 mt-4 w-full">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <label className="text-sm text-[#4a5568] font-semibold block mb-1">Password</label>
                  <FormControl>
                    <div className="border border-[#4a5568] rounded-sm w-full h-11 flex flex-row">
                      <div className="border-r border-[#4a5568] h-full w-11 flex items-center justify-center">
                        <FaLock className="text-[#4a5568] text-xl" />
                      </div>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full h-full px-4 outline-none"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <label className="text-sm text-[#4a5568] font-semibold block mb-1">Confirm Password</label>
                  <FormControl>
                    <div className="border border-[#4a5568] rounded-sm w-full h-11 flex flex-row">
                      <div className="border-r border-[#4a5568] h-full w-11 flex items-center justify-center">
                        <FaLock className="text-[#4a5568] text-xl" />
                      </div>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full h-full px-4 outline-none"
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
            disabled={isLoading || !!successMessage} 
            className="mt-6 bg-[#258094] text-white font-bold py-2 px-4 rounded-md w-full cursor-pointer disabled:opacity-70"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="w-full flex items-center justify-center mt-6">
            <Link href="/login" className="text-sm text-[#4a5568] font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ResetPasswordPage;