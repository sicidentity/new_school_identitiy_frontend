'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInFormSchema } from '@/lib/utils';
import {
  Form
} from '@/components/ui/form';
import { IoMail } from "react-icons/io5";
import { FaLock } from "react-icons/fa6";
import { SignIn } from '@/lib/actions/user.actions';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const formSchema = SignInFormSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ''
    },
  });

  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe');
    if (savedRememberMe !== null) {
      setRememberMe(savedRememberMe === 'true');
    }

    if (savedRememberMe === 'true') {
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        form.setValue('email', savedEmail);
      }
    }
  }, [form]);

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    localStorage.setItem('rememberMe', isChecked.toString());

    if (!isChecked) {
      localStorage.removeItem('userEmail');
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (rememberMe) {
        localStorage.setItem('userEmail', data.email);
      }
      
      const newUser = await SignIn(data.email, data.password);

      if (newUser) {
        router.push('/');
      }
    } catch (error: unknown) {
      console.error("Error during login:", error);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="!flex !flex-col !items-center !justify-center !w-[48vw] !h-[95vh]">
        <header className="!flex !flex-col !items-center !w-[30vw] !mb-[1rem]">
          <Image
            src="/images/Logo.svg"
            alt="img"
            width={70}
            height={70}
            className="!mb-[1rem]"
          />
          <h1 className="!text-3xl !text-[#000] !font-bold !text-justify">Log in to your account</h1>
        </header>

        <div className="!w-[30vw]">
          {errorMessage && (
            <div className="!bg-red-100 !border-l-4 !border-red-500 !text-red-700 !p-4 !mb-4 !rounded">
              <p>{errorMessage}</p>
            </div>
          )}
          
          <div className="!flex !flex-col !gap-4 !mt-10 !w-full">
            <label className="!text-sm !text-[#4a5568] !font-semibold !mb-[-1rem]">Email</label>
            <div className="!border !border-[#4a5568] !rounded-sm !w-[30vw] !h-[2.75rem] !flex !flex-row">
              <div className="!border-r-[1px] !border-[#4a5568] !h-[2.7rem] !w-[2.7rem] !flex !items-center !justify-center">
                <IoMail className="!text-[#4a5568] !text-xl" />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className="!w-[27vw] !px-[1rem]"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="!text-red-500 !text-sm">{form.formState.errors.email.message}</p>
            )}

            <label className="!text-sm !text-[#4a5568] !font-semibold !mb-[-1rem]">Password</label>
            <div className="!border !border-[#4a5568] !rounded-sm !w-[30vw] !h-[2.75rem] !flex !flex-row">
              <div className="!border-r-[1px] !border-[#4a5568] !h-[2.7rem] !w-[2.7rem] !flex !items-center !justify-center">
                <FaLock className="!text-[#4a5568] !text-xl" />
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                className="!w-[27vw] !px-[1rem]"
                {...form.register("password")}
              />
            </div>
            {form.formState.errors.password && (
              <p className="!text-red-500 !text-sm">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="!flex !flex-row !w-[30vw] !justify-between !mt-4">
            <div className="!flex !flex-row !items-center">
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="!rounded-md !w-[1rem] !h-[1rem]" 
              />
              <label htmlFor="rememberMe" className="!text-sm !text-[#4a5568] !font-semibold !ml-2">Remember me</label>
            </div>
            <Link href="/forgot_password" className="!text-[#258094] !text-sm !font-semibold">Forgot password?</Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="!mt-6 !bg-[#258094] !text-white !font-bold !py-2 !px-4 !rounded-md !w-[30vw] !cursor-pointer"
          >
            {isLoading ? 'Logging In...' : 'Login'}
          </button>

          <div className="!flex !flex-col !items-center !justify-center !mt-[2rem] !w-[30vw]">
            <p className="!text-[#000] !text-justify !text-lg">
              Create an account? 
              <Link href="/admin_register" className="!text-[#4a5568] !font-semibold">  Sign Up</Link>
            </p>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default Login;
