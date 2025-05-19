'use client'

import { ClassesResponse } from '@/types';
import Link from 'next/link'
import useSWR from 'swr';


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ClassList() {
  const { data, error, isLoading } = useSWR<ClassesResponse>('/api/attendance/classes', fetcher);
  
  // Safer extraction of classes data
  const classes = data?.data || [];
  
  if (error) return <div>Error loading classes</div>;
  if (isLoading) return <div>Loading...</div>;

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