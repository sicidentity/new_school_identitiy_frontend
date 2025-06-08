'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { VerifyEmail } from '@/lib/actions/user.actions';

const VerifyEmailPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const email = localStorage.getItem('userEmail') || '';

  const formSchema = z.object({
    code: z.string().length(4, "Please enter a 4 digit code"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await VerifyEmail(email, data.code);

      if (result && result.message) {
        setSuccessMessage(result.message || "Email verified successfully");
        form.reset();
        router.push('/')
      }
    } catch (error: unknown) {
      console.error("Error during email verification:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to verify email. Please try again later.");
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
            src="/images/password.svg"
            alt="Logo"
            width={50}
            height={50}
            className="mb-4"
          />
          <h1 className="text-2xl text-black font-bold">Verify Email</h1>
          <p className="text-sm text-[#4a5568] mt-2 text-center">We sent a code to <span className='font-semibold'>{email}</span></p>
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
          
          <div className="flex items-center justify-center gap-4 mt-4 w-[30vw]">
            <Controller
              control={form.control}
              name="code"
              render={({ field }) => (
                <InputOTP
                  maxLength={4}
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                >
                  <InputOTPGroup className="mx-[0.5rem]">
                    <InputOTPSlot index={0} className="border-[#b1b1b1] border-2 focus:border-[#258094] focus:ring focus:ring-opacity-50 focus:ring-[#258094]" />
                  </InputOTPGroup>

                  <InputOTPGroup className="mx-[0.5rem]">
                    <InputOTPSlot index={1} className="border-[#b1b1b1] border-2 focus:border-[#258094] focus:ring focus:ring-opacity-50 focus:ring-[#258094]" />
                  </InputOTPGroup>

                  <InputOTPGroup className="mx-[0.5rem]">
                    <InputOTPSlot index={2} className="border-[#b1b1b1] border-2 focus:border-[#258094] focus:ring focus:ring-opacity-50 focus:ring-[#258094]" />
                  </InputOTPGroup>

                  <InputOTPGroup className="mx-[0.5rem]">
                    <InputOTPSlot index={3} className="border-[#b1b1b1] border-2 focus:border-[#258094] focus:ring focus:ring-opacity-50 focus:ring-[#258094]" />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className="mt-6 bg-[#258094] text-white font-bold py-2 px-4 rounded-md w-full cursor-pointer disabled:opacity-70"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
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

export default VerifyEmailPage;