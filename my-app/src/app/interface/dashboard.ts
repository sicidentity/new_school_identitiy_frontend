import { IconType } from "react-icons";

export interface SidebarItem {
  title: string;
  url: string;
  icon: IconType; // 👈 updated here
}

export interface SidebarProps {
  items: SidebarItem[];
  user: {
    avatarUrl: string;
    name: string;
    email: string;
  };
}
