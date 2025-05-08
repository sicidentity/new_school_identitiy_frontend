'use client';
import Link from 'next/link';

import { LoggedInProvider, useLoggedIn } from '@/hooks/useLoggedIn';

const PanelLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useLoggedIn();
  
  return (
    <div className="flex flex-col min-h-screen w-[100vw]">
      <div className="w-full">
        {isLoggedIn ? (
          <div className="flex justify-between items-center">
            {children}
          </div>
        ) : (
          <div className="flex justify-end">
            <p>User not logged  In</p>
            <Link
              href="/login"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const AuthPanelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LoggedInProvider initialState={false}>
      <PanelLayoutContent>{children}</PanelLayoutContent>
    </LoggedInProvider>
  );
};

export default AuthPanelLayout;