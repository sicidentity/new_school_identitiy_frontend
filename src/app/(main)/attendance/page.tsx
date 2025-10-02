'use client'

import { ClassesResponse } from '@/types';
import Link from 'next/link'
import useSWR from 'swr';
import { useEffect } from 'react';
import Loader from "@/components/main/Loader";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // @ts-expect-error - Adding custom info property to Error object for debugging
    error.info = await res.json().catch(() => ({}));
    // @ts-expect-error - Adding custom status property to Error object for debugging
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export default function ClassList() {
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    all_env: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
  });
   

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/classes`;
  
  console.log('Fetching from URL:', apiUrl); // Add this line
  
  const { data, error, isLoading } = useSWR<ClassesResponse>(
    apiUrl, 
    fetcher
  );
  
  // Log errors for debugging
  useEffect(() => {
    if (error) {
      console.error('Error fetching classes:', error);
      console.error('Error details:', error.info);
      console.error('Status code:', error.status);
    }
  }, [error]);
  
  // Safer extraction of classes data
  const classes = data?.data || [];
  
  if (error) return (
    <div className="p-4 text-red-600">
      <h2 className="text-xl font-bold mb-2">Error loading classes</h2>
      <p>Status: {error.status || 'Unknown'}</p>
      <p>Message: {error.info?.error || 'Unknown error occurred'}</p>
      <p>Please check the console for more details.</p>
    </div>
  );
  
  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader size="1.5em" />
    </div>
  );

  return (
    <div className="bg-white min-h-screen p-5">
      <div className="grid overflow-auto max-h-[calc(100vh-5rem)] mx-auto !px-[2.5%] !pt-[2%] grid-cols-4 gap-4 pb-[10%]">
        {classes.map((cls: { id?: string; name?: string } | string, index: number) => (
          <Link 
            key={typeof cls === 'string' ? cls : cls.id || index} 
            href={`/attendance/${typeof cls === 'string' ? cls : cls.id}`} 
            className="flex items-center justify-center hover:bg-gray-500 bg-gray-300 text-white no-underline !p-[2rem] rounded-md text-center font-bold"
          >
            {typeof cls === 'string' ? cls : cls.name}
          </Link>
        ))}
      </div>
    </div>
  );
}