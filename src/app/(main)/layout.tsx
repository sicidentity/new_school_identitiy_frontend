'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import BreadcrumbNav from "@/components/main/BreadCrumb";
import FilterSearchBar from "@/components/main/FilterComponent";
import { Sidebar } from "@/components/main/Sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { GetLoggedInUser } from '@/lib/actions/user.actions';
import Loader from "@/components/main/Loader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; avatarUrl?: string } | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const loggedInUser = await GetLoggedInUser();
        setUser(loggedInUser || null);

        if (!loggedInUser) {
          router.push('/login');
        }
      } catch (error) {
        console.error("Error fetching logged in user:", error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="!flex !items-center !justify-center !w-[100vw] !min-h-screen">
        <Loader size="3em" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex !pt-[2%] min-h-screen overflow-hidden w-full">
        {/* Sidebar */}
        <Sidebar
          items={[
            { title: "Dashboard", url: "/", iconName: "dashboard" },
            { title: "User Management", url: "/user-management", iconName: "users" },
            { title: "Student Management", url: "/student-management", iconName: "student" },
            { title: "Attendance", url: "/attendance", iconName: "attendance" },
            { title: "Report", url: "/report", iconName: "report" },
            { title: "Parents Management", url: "/parent-management", iconName: "parent" },
            { title: "Class Management", url: "/class-management", iconName: "class" },
            { title: "Student Card", url: "/create_student_card", iconName: "card" },
          ]}
          user={{
            name: user.name || "Austin Dev",
            email: user.email || "austindev214@gmail.com",
            avatarUrl: user.avatarUrl || "https://i.pravatar.cc/100",
          }}
        />

        <div className=" w-full h-full bg-gray-200 flex flex-col  !px-4 !py-2">
          <div className="pt-4">
            <header className="sticky w-full top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <BreadcrumbNav />
              </div>

              <div className="flex-end">
                <FilterSearchBar />
              </div>
            </header>

            <main className="flex-1 overflow-auto !pt-8 ">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}