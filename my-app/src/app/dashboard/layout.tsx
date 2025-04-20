// This layout wraps all dashboard pages

import BreadcrumbNav from "@/components/dashboard/BreadCrumb";
import { Sidebar } from "@/components/dashboard/Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

// import { IconType } from "react-icons"; // 👈 import the proper type
// import { FaChartBar, FaClipboardList, FaTachometerAlt, FaUserGraduate, FaUsers } from "react-icons/fa";

// const menuItems: {
//   title: string;
//   url: string;
//   icon: IconType; // 👈 specify this instead of ComponentType or any
// }[] = [
//   {
//     title: "Dashboard",
//     url: "/dashboard",
//     icon: FaTachometerAlt
//   },
//   {
//     title: "User Management",
//     url: "/user-management",
//     icon: FaUsers
//   },
//   {
//     title: "Student Management",
//     url: "/student-management",
//     icon: FaUserGraduate
//   },
//   {
//     title: "Attendance",
//     url: "/attendance",
//     icon: FaClipboardList
//   },
//   {
//     title: "Report",
//     url: "/report",
//     icon: FaChartBar
//   }
// ];


// const userProfile = {
//   avatarUrl: "https://example.com/avatar.jpg",
//   name: "John Doe",
//   email: "email@example.com"
// };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
      items={[
        { title: "Dashboard", url: "/dashboard", iconName: "dashboard" },
        { title: "Analytics", url: "/analytics", iconName: "analytics" },
        { title: "Users", url: "/users", iconName: "users" },
      ]}
      user={{
        name: "Austin Dev",
        email: "austindev214@gmail.com",
        avatarUrl: "https://i.pravatar.cc/100",
      }}
    />

        {/* Main section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky header with trigger and breadcrumb */}
          <header className="sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between">
            <SidebarTrigger />
            <BreadcrumbNav />
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
