'use client';

import { useState, useEffect } from 'react';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { FiSettings } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import { IoPersonOutline } from "react-icons/io5";
import { FaPeopleLine } from "react-icons/fa6";
import { MdOutlineFactCheck } from "react-icons/md";
import { MdShowChart } from "react-icons/md";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = ({ name, email }: SidebarProps): JSX.Element => {
  const { isOpen } = useSidebarToggle();
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState<string>('');

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  const handleLinkClick = (path: string): void => {
    setActiveLink(path);
  };

  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: <RxDashboard size={20} /> },
    { path: '/user_management', label: 'User Management', icon: <IoPersonOutline size={20} /> },
    { path: '/student_management', label: 'Student Management', icon: <FaPeopleLine size={20} /> },
    { path: '/attendance', label: 'Attendance', icon: <MdOutlineFactCheck size={20} /> },
    { path: '/report', label: 'Report', icon: <MdShowChart size={20} /> },
  ];

  return (
    <div 
      className={`fixed top-0 left-0 h-screen bg-[#fff] text-black flex flex-col border-none transition-all duration-300 ${
        isOpen ? 'w-[17rem]' : 'w-[4rem]'
      }`}
    >
      <div className="w-full p-4 flex flex-col">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/Logo.svg" alt="Logo" className="mt-4" width={70} height={70} />
          {isOpen && <span className="text-[#258094] font-bold text-[26px]">MyApp</span>}
        </Link>
        
        <div className="flex flex-col gap-2 mt-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors font-semibold ${
                activeLink === item.path
                  ? 'bg-[#268094] text-[#fff]'
                  : 'hover:bg-gray-300'
              }`}
              onClick={() => handleLinkClick(item.path)}
            >
              <span className={`${activeLink === item.path ? 'text-white' : ''}`}>
                {item.icon}
              </span>
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mt-auto w-full p-4 flex flex-col">
        <div className="text-sm opacity-75">
          <Link
            href="/settings"
            className={`flex items-center gap-2 p-2 rounded-md transition-colors font-semibold ${
              activeLink === '/settings'
                ? 'bg-[#268094] text-[#fff]'
                : 'hover:bg-gray-300'
            }`}
            onClick={() => handleLinkClick('/settings')}
          >
            <span className={`${activeLink === '/settings' ? 'text-white' : ''}`}>
              <FiSettings size={20} />
            </span>
            {isOpen && <span>Settings</span>}
          </Link>
        </div>
        
          <div className="font-medium mt-2">
            {isOpen ? (
              <div className="flex flex-row items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-[#268094] text-white flex items-center justify-center">
                  {name && name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-medium">{name}</h2>
                  <p className="text-xs text-gray-600">{email}</p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#268094] text-white flex items-center justify-center">
                {name && name.charAt(0)}
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Sidebar;