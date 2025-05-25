'use client';

import { useState, useEffect } from 'react';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { GetLoggedInUser } from '@/lib/actions/user.actions';
import { GetStudents } from '@/lib/actions/student.actions';
import DashboardCard from '@/components/Card';
import StudentTable from '@/components/StudentTable';
import { ScrollArea } from "@/components/ui/scroll-area"
import { TbUsers } from "react-icons/tb";
import { BiSolidSchool } from "react-icons/bi";
import { FaCalendarAlt } from "react-icons/fa";
import AttendanceGraph from '@/components/AttendanceGraph';
import { getClasses } from '@/lib/actions/class.actions';
import { getClassStatistics } from '@/lib/actions/attendance.actions';

export default function Home() {
  const { isOpen, toggleSidebar } = useSidebarToggle();
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Student[]>([]);
  const [totalAttendanceToday, setTotalAttendanceToday] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await GetLoggedInUser();
        if (userData) {
          setUser(userData);
        } else {
          console.error('Failed to fetch User');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const studentsData = await GetStudents();
        const classesData = await getClasses();
        if (studentsData && classesData) {
          setStudents(studentsData);
          setClasses(classesData);
        } else {
          console.error('Failed to fetch students and classes data');
        }
      } catch (error) {
        console.error('Error fetching students and classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchDailyAttendance = async () => {
      if (classes.length === 0) return;

      let totalAttendanceToday = 0;
      const classAttendanceData = [];

      for (const classItem of classes) {
        try {
          const classStats = await getClassStatistics(classItem.id);

          const attendanceRate = classStats.attendanceRate || 0;
          const presentStudents = Math.round((attendanceRate / 100) * classStats.totalStudents);
          
          classAttendanceData.push({
            className: classItem.name,
            attendanceRate: attendanceRate,
            presentStudents: presentStudents,
            totalStudents: classStats.totalStudents
          });

          totalAttendanceToday += presentStudents;
        } catch (classError) {
          console.warn(`Failed to get stats for class ${classItem.id}:`, classError);
          classAttendanceData.push({
            className: classItem.name,
            attendanceRate: 0,
            presentStudents: 0,
            totalStudents: 0
          });
        }
      }

      setTotalAttendanceToday(totalAttendanceToday);
    };

    fetchDailyAttendance();
  }, [classes]); // Added classes as dependency

  return (
    <div className="w-full flex flex-col h-screen py-[2rem] pl-[6rem] pr-[2rem] bg-[#f1f3f4]">
      <div className="w-full flex flex-row items-center justify-between mb-[1rem]">
        <div className="flex flex-row items-center">
          <div className="text-[#268094] mr-[1rem] cursor-pointer" onClick={toggleSidebar}>
            {isOpen ? (
              <LuPanelLeftClose size={24} />
            ) : (
              <LuPanelLeftOpen size={24} />
            )}
          </div>
          {user && <h1 className="font-bold text-[24px] text-justify">Hey {user.name}</h1>}
        </div>
        
        <div>
          <button className="text-[#fff] rounded bg-[#268094] p-2">Enroll Student</button>
        </div>
      </div>

      <div className="w-full flex flex-row items-center justify-between mb-[1rem]">
        <DashboardCard 
          title="Total Students" 
          value={students.length.toString()} 
          icon={<TbUsers className="h-5 w-5" />} 
        />
        <DashboardCard 
          title="Total Classes" 
          value={classes.length.toString()} 
          icon={<BiSolidSchool className="h-5 w-5" />} 
        />
        <DashboardCard 
          title="Attendance Today" 
          value={totalAttendanceToday.toString()} 
          icon={<FaCalendarAlt className="h-5 w-5" />} 
        />
      </div>

      <h3 className="font-bold text-xl text-[#000] mb-[1rem]">Attendance Report</h3>
      <div className="mb-[1rem]">
        <AttendanceGraph />
      </div>
      
      <h3 className="font-bold text-xl text-[#000] mb-[1rem]">Student Attendance</h3>
      {/* <div className="flex-1 overflow-hidden">
        <ScrollArea className="w-full h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading student data...</p>
            </div>
          ) : (
            <StudentTable students={students} />
          )}
        </ScrollArea>
      </div> */}
    </div>
  );
}