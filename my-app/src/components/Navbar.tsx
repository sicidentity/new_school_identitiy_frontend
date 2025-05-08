'use client';

import { GetLoggedInUser } from '@/lib/actions/user.actions';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';

const Navbar = () => {
  // const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const { isOpen, toggleSidebar } = useSidebarToggle();

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const loggedInUser = await GetLoggedInUser();
        console.log('user', loggedInUser);
        setLoggedIn(!!loggedInUser);
        setUser(loggedInUser);
      } catch (error) {
        setLoggedIn(false);
        console.error('Error checking login status:', error);
      }
    };

    checkLoggedInStatus();
  }, []);

  return (
    <div className={cn(
      "sticky right-0 top-0 h-12 bg-gray-200 text-black flex items-center justify-between border-2 border-b-gray-400 px-4",
      isOpen ? "ml-[17rem]" : "ml-[4rem]"
      )}
    >
      <div className="cursor-pointer" onClick={toggleSidebar}>
        {isOpen ? (
          <LuPanelLeftClose size={24} />
        ) : (
          <LuPanelLeftOpen size={24} />
        )}
        <h1>Hey {user?.name}!</h1>
      </div>
      <div className="flex items-center gap-4">
        {loggedIn ? (
          <div className="flex items-center gap-4">
            <div>Hey, {user?.name}</div>

          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href='/sign_up' className="hover:underline">Sign Up</Link>
            <Link href='/sign_in' className="bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800 rounded-md px-4 py-2 hover:opacity-90">Log In</Link>
          </div>
        )}
    
      </div>
    </div>
  );
};

export default Navbar;