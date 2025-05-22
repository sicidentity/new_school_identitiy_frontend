import React, { useState } from 'react';
import Link from 'next/link';
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { CreateStudentSchema } from '@/lib/utils';

const StudentManagementPage = () => {
  const { isOpen, toggleSidebar } = useSidebarToggle();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
      const formSchema = CreateStudentSchema();

  return (
    <div  className="w-full flex flex-col h-screen py-[2rem] pl-[6rem] pr-[2rem] bg-[#f1f3f4]">
      <div className="w-full flex flex-row items-center justify-between mb-[2rem]">
        <div className="flex flex-row items-center">
          <div className="text-[#268094] mr-[1rem] cursor-pointer" onClick={toggleSidebar}>
            {isOpen ? (
              <LuPanelLeftClose size={24} />
            ) : (
              <LuPanelLeftOpen size={24} />
            )}
          </div>
          <h1 className="font-bold text-[24px] text-justify">Student Management</h1>
        </div>
        
        <div>
          <Link href="/create_user" className="text-[#fff] rounded bg-[#268094] p-2">Create New User</Link>
        </div>
      </div>
      <div className="w-full p-4 bg-[#fff] grid grid-cols-4 gap-4">
        
      </div>
    </div>
  )
}

export default StudentManagementPage