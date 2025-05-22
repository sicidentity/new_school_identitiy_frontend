'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebarToggle } from '@/hooks/useSidebarToggle';
import { GetLoggedInUser } from '@/lib/actions/user.actions';

const PanelLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useSidebarToggle();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedUser = async (): Promise<void> => {
      const getUser = await GetLoggedInUser();

      if (!getUser) {
        console.error('failed to fetch user');
        return;
      }

      setUser(getUser as User);
    };

    loggedUser();
  }, []);

  return (
    <div className="flex flex-row w-[100vw] min-h-screen">
      {user && <Sidebar name={user.name} email={user.email} />}
      <div className="flex flex-col flex-grow">
        <main
          className={cn(
            "flex-grow transition-all ease-in-out duration-300 bg-[#f1f3f4] min-h-[calc(100vh-3rem)] overflow-x-hidden",
            isOpen ? "ml-48" : "ml-0"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider initialState={false}>
      <PanelLayoutContent>{children}</PanelLayoutContent>
    </SidebarProvider>
  );
};

export default PanelLayout;