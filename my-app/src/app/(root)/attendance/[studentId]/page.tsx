import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { getStudentById } from '@/lib/actions/student.actions';
import StudentReportTable from '@/components/StudentReportTable';

const StudentAttendancePage = () => {
  const { isOpen, toggleSidebar } = useSidebarToggle();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudent = async (): Promise<void> => {
      try {
        const getStudent = await getStudentById();
        
        if (!getStudent) {
          console.error('Failed to fetch student by id');
          return;
        }
        
        setStudent(getStudent);
      } catch (error) {
        console.error('Error fetching student by id:', error);
      }
    };
    
    fetchStudent();
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
      <div className="w-full p-4 bg-[#fff] flex flex-row">
        <div>
          {student?.name}
        </div>
        <div className='flex flex-col'>
          <h2>Student ID</h2>
          <p>{student?.id}</p>
        </div>
        <div className='flex flex-col'>
          <h2>Admission Date</h2>
          <p>{student?.id}</p>
        </div>
        <div className='flex flex-col'>
          <h2>Class</h2>
          <p>{student?.class.name}</p>
        </div>
      </div>

      <StudentReportTable attendance={student?.attendances} />
    </div>
  )
}

export default StudentAttendancePage