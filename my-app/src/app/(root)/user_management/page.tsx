'use client';

import { useState, useEffect } from 'react';
import UserTable from '@/components/UserTable';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { GetAllUsers } from '@/lib/actions/user.actions';
import Link from 'next/link';
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";

export default function UserManagement() {
  const { isOpen, toggleSidebar } = useSidebarToggle();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const userData = await GetAllUsers();
        console.log(userData);
        if (userData) {
          setUsers(userData.users);
        } else {
          console.error('Failed to fetch Users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  
  return (
    <div className="w-full flex flex-col h-screen py-[2rem] pl-[6rem] pr-[2rem] bg-[#f1f3f4]">
      <div className="w-full flex flex-row items-center justify-between mb-[2rem]">
        <div className="flex flex-row items-center">
          <div className="text-[#268094] mr-[1rem] cursor-pointer" onClick={toggleSidebar}>
            {isOpen ? (
              <LuPanelLeftClose size={24} />
            ) : (
              <LuPanelLeftOpen size={24} />
            )}
          </div>
          <h1 className="font-bold text-[24px] text-justify">User Management</h1>
        </div>
        
        <div>
          <Link href="/create_user" className="text-[#fff] rounded bg-[#268094] p-2">Create New User</Link>
        </div>
      </div>

      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <UserTable users={users} />
        )}
      </div>
    </div>
  );
}
