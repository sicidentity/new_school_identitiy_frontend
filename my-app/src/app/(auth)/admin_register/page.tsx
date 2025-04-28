'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema } from '@/lib/utils';
import {
  Form
} from '@/components/ui/form';
import { MdDriveFileRenameOutline } from "react-icons/md";
import { IoMail } from "react-icons/io5";
import { FaLock } from "react-icons/fa6";
import { SignUp } from '@/lib/actions/user.actions';

const AdminRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const formSchema = FormSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ''
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const newUser = await SignUp(data.name, data.email, data.password);

      if (newUser) {
        localStorage.setItem('userEmail', data.email);
        router.push('/verify_email');
      }
    } catch (error: unknown) {
      console.error("Error during registration:", error);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center justify-center w-[48vw] h-[95vh]">
        <header className="flex flex-col items-center w-[30vw] mb-[1rem]">
          <Image
            src="/images/Logo.svg"
            alt="img"
            width={70}
            height={70}
            className="mb-[1rem]"
          />
          <h1 className="text-3xl text-[#000] font-bold text-justify">Create a new account</h1>
        </header>

        <div className="w-[30vw]">
          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p>{errorMessage}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-4 mt-10 w-full">
            <label className="text-sm text-[#4a5568] font-semibold mb-[-1rem]">Name</label>
            <div className="border border-[#4a5568] rounded-sm w-[30vw] h-[2.75rem] flex flex-row">
              <div className="border-r-[1px] border-[#4a5568] h-[2.7rem] w-[2.7rem] flex items-center justify-center">
                <MdDriveFileRenameOutline className="text-[#4a5568] text-xl" />
              </div>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-[25vw] px-[1rem]"
                {...form.register("name")}
              />
            </div>
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
            )}

            <label className="text-sm text-[#4a5568] font-semibold mb-[-1rem]">Email</label>
            <div className="border border-[#4a5568] rounded-sm w-[30vw] h-[2.75rem] flex flex-row">
              <div className="border-r-[1px] border-[#4a5568] h-[2.7rem] w-[2.7rem] flex items-center justify-center">
                <IoMail className="text-[#4a5568] text-xl" />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-[27vw] px-[1rem]"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
            )}

            <label className="text-sm text-[#4a5568] font-semibold mb-[-1rem]">Password</label>
            <div className="border border-[#4a5568] rounded-sm w-[30vw] h-[2.75rem] flex flex-row">
              <div className="border-r-[1px] border-[#4a5568] h-[2.7rem] w-[2.7rem] flex items-center justify-center">
                <FaLock className="text-[#4a5568] text-xl" />
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-[27vw] px-[1rem]"
                {...form.register("password")}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
            )}
          </div>
          <button 
            type="submit" 
            disabled={isLoading} 
            className="mt-6 bg-[#258094] text-white font-bold py-2 px-4 rounded-md w-[30vw] cursor-pointer"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          <div className="flex flex-col items-center justify-center mt-[2rem] w-[30vw]">
            <p className="text-[#000] text-justify text-lg"> Already have an account? 
              <Link href="/login" className="text-[#4a5568] font-semibold">  Login</Link>
            </p>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default AdminRegister;