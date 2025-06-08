// This layout wraps all dashboard pages
import BreadcrumbNav from "@/components/main/BreadCrumb";
import FilterSearchBar from "@/components/main/FilterComponent";
import { Sidebar } from "@/components/main/Sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
// import FilterSearchBar from './../../components/dashboard/FilterComponent';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="flex !pt-[2%] min-h-screen overflow-hidden w-full">
        {/* Sidebar */}
        <Sidebar
          items={[
            { title: "Dashboard", url: "/dashboard", iconName: "dashboard" },
            { title: "User Management", url: "/user-management", iconName: "users" },
            { title: "Student Management", url: "/student-management", iconName: "student" },
            { title: "Attendance", url: "/attendance", iconName: "attendance" },
            { title: "Report", url: "/report", iconName: "report" },
            { title: "Parents Management", url: "/parent-management", iconName: "parent" },
            { title: "Class Management", url: "/class-management", iconName: "class" },
          ]}
          user={{
            name: "Austin Dev",
            email: "austindev214@gmail.com",
            avatarUrl: "https://i.pravatar.cc/100",
          }} // edit for login in user details 
        />

        {/* Main section */}
        <div className=" w-full h-full bg-gray-200 flex flex-col  !px-4 !py-2">
          {/* Sticky header with trigger and breadcrumb */}
            <div className="pt-4"> {/* Adds padding from the top of the page */}
            <header className="sticky w-full top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between">
              {/* Left Side */}
              <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <BreadcrumbNav />
              </div>

              {/* Right Side (Filter + Search inputs) */}
              <div className="flex-end">
              <FilterSearchBar />
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-auto !pt-8 ">
              {children}
            </main>
            </div>
        </div>
      </div>
    </div>
  );
}
