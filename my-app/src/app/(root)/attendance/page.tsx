import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { getClasses } from '@/lib/actions/class.actions';

const AttendancePage = () => {
  const { isOpen, toggleSidebar } = useSidebarToggle();
  const [classes, setClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    const fetchClasses = async (): Promise<void> => {
      try {
        const getClass = await getClasses();
        
        if (!getClass) {
          console.error('Failed to fetch classes');
          return;
        }
        
        setClasses(getClass);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    
    fetchClasses();
  }, []);

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
          <h1 className="font-bold text-[24px] text-justify">Attendance</h1>
        </div>
        
        <div>
          <Link href="/create_user" className="text-[#fff] rounded bg-[#268094] p-2">Create New User</Link>
        </div>
      </div>
      <div className="w-full p-4 bg-[#fff] grid grid-cols-4 gap-4">
        {classes.map((classItem) => (
          <Link href={`/attendance/${classItem.id}`} key={classItem.id} className="p-4 bg-[#f1f3f4] rounded flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg font-bold">{classItem.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AttendancePage