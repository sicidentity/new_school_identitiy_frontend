// This layout wraps all dashboard pages
import BreadcrumbNav from "@/components/dashboard/BreadCrumb";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import FilterSearchBar from './../../components/dashboard/FilterComponent';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="flex h-screen overflow-hidden w-full">
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
        <div className="flex-1 bg-gray-200 flex flex-col overflow-hidden !px-4 !py-2">
          {/* Sticky header with trigger and breadcrumb */}
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
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}