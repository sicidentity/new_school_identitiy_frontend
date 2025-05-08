'use client';

// import { GetLoggedInUser } from '@/lib/actions/user.actions';
// import { useState, useEffect } from 'react';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { FiSettings } from "react-icons/fi";
import { FaTachometerAlt } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";
import { FaUserGraduate } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { HiOutlineDocumentReport } from "react-icons/hi";
import Image from 'next/image';
import Link from 'next/link'; 

const Sidebar = () => {
  // const [user, setUser] = useState(null);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [loading, setLoading] = useState(false);
  const { isOpen } = useSidebarToggle();

  // useEffect(() => {
  //   const checkLoggedInStatus = async () => {
  //     try {
  //       const loggedInUser = await GetLoggedInUser();
  //       setUser(loggedInUser);
  //       setIsLoggedIn(!!loggedInUser);

  //       if (loggedInUser) {
          
  //       }
  //     } catch (error) {
  //       console.error('Error checking login status:', error);
  //     }
  //   };

  //   checkLoggedInStatus();
  // }, []);

  return (
    <div 
      className={`fixed top-0 left-0 h-screen bg-gray-200 dark:bg-gray-800 text-black dark:text-white flex flex-col border-r-2 border-gray-400 transition-all duration-300 ${
        isOpen ? 'w-[17rem]' : 'w-[4rem]'
      }`}
    >
      <div className="w-full p-4 flex flex-col">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/Logo.svg" alt="Logo" className="mt-4" width={70} height={70} />
          <span>MyApp</span>
        </Link>
        
        <div className="flex flex-col gap-2">
          <Link href="/dashboard" className="flex flex-row items-center gap-2 p-2 hover:bg-gray-300 rounded-md">
            <FaTachometerAlt size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/user_management" className="flex flex-row items-center gap-2 p-2 hover:bg-gray-300 rounded-md">
            <MdManageAccounts size={20} />
            <span>User Management</span>
          </Link>
          <Link href="/student_management" className="flex flex-row items-center gap-2 p-2 hover:bg-gray-300 rounded-md">
            <FaUserGraduate size={20} />
            <span>Student Management</span>
          </Link>
          <Link href="/attendance" className="flex items-center flex-row gap-2 p-2 hover:bg-gray-300 rounded-md">
            <IoCalendarOutline size={20} />
            <span>Attendance</span>
          </Link>
          <Link href="/report" className="flex items-center flex-row gap-2 p-2 hover:bg-gray-300 rounded-md">
            <HiOutlineDocumentReport size={20} />
            <span>Report</span>
          </Link>
        </div>
      </div>
      
      <div className="mt-auto border-t-2 border-gray-400 w-full p-4">
        <div className="text-sm opacity-75">
          <Link href="/Settings" className="flex items-center flex-row gap-2 p-2 hover:bg-gray-300 rounded-md">
            <FiSettings size={20} />
            <span>Settings</span>
          </Link>
        </div>
        {/* <div className="font-medium truncate">{user?.name}</div> */}
      </div>
    </div>
  );
};

export default Sidebar;