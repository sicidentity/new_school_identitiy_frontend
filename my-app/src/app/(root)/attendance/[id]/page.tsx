'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { getClassById } from '@/lib/actions/class.actions';
import AttendanceTable from '@/components/AttendanceTable';

interface RouteParams {
  classId: string;
}

const ClassAttendancePage = () => {
  const params = useParams<RouteParams>();
  const classId = params.id;
  const { isOpen, toggleSidebar } = useSidebarToggle();
  const [classData, setClassData] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClass = async (): Promise<void> => {
      if (!classId) {
        setError('No class ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedClass = await getClassById(classId);
        
        if (!fetchedClass) {
          setError('Failed to fetch class data');
          return;
        }
        
        setClassData(fetchedClass);
      } catch (error) {
        console.error('Error fetching class:', error);
        setError('Error fetching class data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClass();
  }, [classId]);

  return (
    <div className="w-full flex flex-col h-screen py-8 pl-24 pr-8 bg-[#f1f3f4]">
      <div className="w-full flex flex-row items-center justify-between mb-8">
        <div className="flex flex-row items-center">
          <div className="text-[#268094] mr-4 cursor-pointer" onClick={toggleSidebar}>
            {isOpen ? (
              <LuPanelLeftClose size={24} />
            ) : (
              <LuPanelLeftOpen size={24} />
            )}
          </div>
          <h1 className="font-bold text-2xl text-justify">Attendance</h1>
        </div>
        
        <div>
          <Link href="/create_user" className="text-white rounded bg-[#268094] p-2">
            Create New User
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <p>Loading class data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : classData ? (
        <h1>{classData.name}</h1>
      ) : (
        <p>No class data available</p>
      )}

      <div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <AttendanceTable students={classData?.students} />
        )}
            </div>
    </div>
  );
};

export default ClassAttendancePage;
