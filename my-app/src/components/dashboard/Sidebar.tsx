'use client';

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
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
import { FiSettings } from "react-icons/fi";
import { FaTachometerAlt } from "react-icons/fa";
import { BsGraphUp } from "react-icons/bs";
import { MdGroup } from "react-icons/md";
import { ComponentType } from "react";

type SidebarItem = {
  title: string;
  url: string;
  iconName: "dashboard" | "analytics" | "users";
};

type SidebarProps = {
  items: SidebarItem[];
  user: {
    name: string;
    email: string;
    avatarUrl: string;
  };
};

const iconMap: Record<SidebarItem["iconName"], ComponentType<{ className?: string }>> = {
  dashboard: FaTachometerAlt,
  analytics: BsGraphUp,
  users: MdGroup,
};

export function Sidebar({ items, user }: SidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarRoot side="left" variant="sidebar" collapsible="icon" className="group">
      <SidebarContent className="h-screen !p-[7%] flex flex-col justify-between bg-grey text-white w-64 group-data-[collapsed=true]:w-20 transition-all duration-300">
        <div className="flex flex-col h-full">
          <SidebarHeader className={`flex ${isCollapsed ? 'justify-center' : 'justify-start'} !mb-[20%]`}>
            <div className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${isCollapsed ? 'w-10 h-10' : 'w-full'}`}>
              <Image src="/globe.svg" alt="Sidebar Logo" width={isCollapsed ? 24 : 30} height={isCollapsed ? 24 : 30} className="transition-all duration-300" />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = iconMap[item.iconName];
                    return (
                      <SidebarMenuItem key={item.title} className="text-gray-500 hover:text-white">
                        {isCollapsed ? (
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton className="hover:bg-green-800 !pl-[25%] transition-all duration-300" asChild>
                                  <a href={item.url}>
                                    <Icon className="min-w-[1rem]" />
                                  </a>
                                </SidebarMenuButton>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="rounded-full px-4 py-2 bg-black text-white shadow-lg text-sm" sideOffset={5}>
                                <p>{item.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <SidebarMenuButton className="hover:bg-green-800 !pl-[5%] transition-all duration-300" asChild>
                            <a href={item.url} className="flex items-center gap-2">
                              <Icon className="min-w-[1rem]" />
                              <span>{item.title}</span>
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

          <div className="flex-grow" />

          <SidebarGroup className="!mb-[13%]">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="text-gray-500">
                  {isCollapsed ? (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton className="hover:bg-gray-700 !pl-[25%] transition-all duration-300" asChild>
                            <button>
                              <FiSettings className="w-4 h-4 min-w-[1rem]" />
                            </button>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="rounded-full px-4 py-2 bg-black text-white shadow-lg text-sm" sideOffset={5}>
                          <p>Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <SidebarMenuButton className="hover:bg-gray-700 !pl-[5%] transition-all duration-300" asChild>
                      <button className="flex items-center gap-2">
                        <FiSettings className="w-4 h-4 min-w-[1rem]" />
                        <span>Settings</span>
                      </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <SidebarFooter className="mt-2">
          <SidebarMenu>
            <SidebarMenuItem className="text-gray-300">
              {isCollapsed ? (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuButton className="!pl-[25%] hover:bg-gray-500 rounded-sm transition-all duration-300 w-full">
                            <div className="flex w-full rounded-sm items-center justify-center hover:bg-gray-500">
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                            </div>
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-black text-white px-4 py-2 rounded-full shadow-lg text-sm">
                      <p>{user.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="!pl-[5%] hover:bg-gray-500 rounded-sm transition-all duration-300 w-full">
                      <div className="flex w-full rounded-sm items-center gap-x-2 hover:bg-gray-500">
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium truncate">{user.name}</span>
                          <span className="text-xs truncate">{user.email}</span>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 p-2 bg-white rounded-md shadow-lg" side="right" align="start">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </SidebarRoot>
  );
}
