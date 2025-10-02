'use client';

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { useState } from "react";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { FaChalkboardTeacher, FaTachometerAlt, FaUserGraduate, FaUserFriends, FaAddressCard } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";
import { IoCalendarOutline } from "react-icons/io5";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { ComponentType } from "react";

type SidebarItem = {
  title: string;
  url: string;
  iconName: "dashboard" | "attendance" | "users" | "student" | "report" | "parent" | "class" | "card";
};

type SidebarProps = {
  items: SidebarItem[];
  user: {
    name: string;
    email: string;
    avatarUrl: string;
  };
  activeItem?: string; // Optional prop for initial active item
};

const iconMap: Record<SidebarItem["iconName"], ComponentType<{ className?: string }>> = {
  dashboard: FaTachometerAlt,
  users: MdManageAccounts,
  student: FaUserGraduate,
  attendance: IoCalendarOutline,
  report: HiOutlineDocumentReport,
  parent: FaUserFriends,
  class: FaChalkboardTeacher,
  card: FaAddressCard,
};

export function Sidebar({ items, user, activeItem }: SidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [activeUrl, setActiveUrl] = useState(activeItem || items[0]?.url || "");

  const handleItemClick = (url: string) => {
    setActiveUrl(url);
  };

  return (
    <SidebarRoot side="left" variant="sidebar" collapsible="icon" className="group border-r border-gray-200">
      <div className="h-screen flex flex-col !px-[7%] !py-[2rem]">
        <SidebarHeader className={`px-6 py-6 border-b border-gray-100 !mb-[1rem] ${isCollapsed ? 'px-4' : ''}`}>
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Sidebar Logo" width={isCollapsed ? 24 : 30} height={isCollapsed ? 24 : 30} className="transition-all duration-300" />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-900">My App</span>
                  <span className="text-xs text-gray-500">Management System</span>
                </div>
              )}
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {items.map((item) => {
                  const Icon = iconMap[item.iconName];
                  const isActive = activeUrl === item.url;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      {isCollapsed ? (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton 
                                className={`
                                  !h-[2.5rem] flex items-center gap-2 p-2 rounded-md transition-colors font-semibold !text-[#171717CC] !hover:bg-gray-200
                                  ${isActive 
                                    ? '!bg-[#268094] !text-[#fff]' 
                                    : '!hover:bg-gray-300'
                                  }
                                `}
                                asChild
                              >
                                <a 
                                  href={item.url}
                                  onClick={() => handleItemClick(item.url)}
                                >
                                  <Icon className="w-5 h-5" />
                                </a>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="right" 
                              className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg" 
                              sideOffset={10}
                            >
                              <p>{item.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <SidebarMenuButton 
                          className={`
                            !h-[2.5rem] flex items-center gap-2 !px-4 rounded-md transition-colors font-semibold !text-[#171717CC] !hover:bg-gray-200
                            ${isActive 
                              ? '!bg-[#268094] !text-[#fff]' 
                              : '!hover:bg-gray-300'
                            }
                          `}
                          asChild
                        >
                          <a 
                            href={item.url}
                            onClick={() => handleItemClick(item.url)}
                            className="flex items-center gap-3 w-full"
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
        
                          </a>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="px-3 py-2 border-t !mb-[2rem] border-gray-100">

          <SidebarGroup className="!mb-[13%]">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  {isCollapsed ? (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            className="!h-[2.5rem] flex items-center gap-2 p-2 rounded-md transition-colors font-semibold !text-[#171717CC] !hover:bg-gray-200"
                            asChild
                          >
                            <button>
                              <FiSettings className="w-5 h-5" />
                            </button>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg" 
                          sideOffset={10}
                        >
                          <p>Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <SidebarMenuButton 
                      className="!h-[2.5rem] flex items-center gap-2 p-2 rounded-md transition-colors font-semibold !text-[#171717CC] !hover:bg-gray-200"
                      asChild
                    >
                      <button className="flex items-center gap-3 w-full">
                        <FiSettings className="w-5 h-5 flex-shrink-0" />
                        <span>Settings</span>
                      </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer */}
        <SidebarFooter className="p-3 border-t border-gray-100">
          <SidebarMenu>
            <SidebarMenuItem>
              {isCollapsed ? (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuButton className="w-12 h-12 mx-2 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          className="w-56 p-2 bg-white rounded-lg shadow-lg border border-gray-200" 
                          side="right" 
                          align="start"
                          sideOffset={10}
                        >
                          <div className="px-3 py-2 border-b border-gray-100 mb-2">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <DropdownMenuItem className="text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                            Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                            Billing
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                            Team
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                            Subscription
                          </DropdownMenuItem>
                          <div className="h-px bg-gray-200 my-2"></div>
                          <DropdownMenuItem className="text-sm text-red-600 hover:bg-red-50 rounded-md">
                            <FiLogOut className="w-4 h-4 mr-2" />
                            Sign out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg"
                      sideOffset={10}
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs opacity-75">{user.email}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="mx-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 w-full">
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium text-gray-900 truncate">{user.name}</span>
                          <span className="text-xs text-gray-500 truncate">{user.email}</span>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-56 p-2 bg-white rounded-lg shadow-lg border border-gray-200" 
                    side="right" 
                    align="start"
                    sideOffset={10}
                  >
                    <div className="px-3 py-2 border-b border-gray-100 mb-2">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuItem className="text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      Team
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      Subscription
                    </DropdownMenuItem>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <DropdownMenuItem className="text-sm text-red-600 hover:bg-red-50 rounded-md">
                      <FiLogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </SidebarRoot>
  );
}