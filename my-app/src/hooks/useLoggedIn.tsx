'use client';

import { useState, useEffect, createContext, useContext, useMemo, ReactNode } from 'react';
import { GetLoggedInUser } from '@/lib/actions/user.actions';
import { LoggedInContextType } from '@/types';

const LoggedInContext = createContext<LoggedInContextType>({
  isLoggedIn: false,
});

export const LoggedInProvider = ({ children, initialState = false }: { children: ReactNode, initialState?: boolean }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        setIsLoading(true);
        const user = await GetLoggedInUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error("Error checking user login status:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const value = useMemo(() => ({
    isLoggedIn,
  }), [isLoggedIn]);

  return (
    <LoggedInContext.Provider value={value}>
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <p>Loading...</p>
        </div>
      ) : (
        children
      )}
    </LoggedInContext.Provider>
  );
};

export const useLoggedIn = () => {
  const context = useContext(LoggedInContext);
  if (context === undefined) {
    throw new Error('useLoggedIn must be used within a LoggedInProvider');
  }
  return context;
};