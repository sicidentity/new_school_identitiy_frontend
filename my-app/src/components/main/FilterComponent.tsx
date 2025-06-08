'use client';

import { FaFilter, FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

export default function FilterSearchBar() {
  return (
    <div className="flex items-center gap-1 justify-end pr-4 !mr-[2rem]">
      
      {/* Filter input + icon */}
      <div className="flex h-9 w-[240px]! !mx-[1rem]">
        <Input
          type="text"
          placeholder="Filter Data"
          className="rounded-r-none !rounded-l-sm !border !border-gray-300 !pl-4 !bg-white"
        />
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className="flex items-center justify-center w-9 px-2 text-gray-500 bg-[#268094] border border-input rounded-r-sm shadow-xs 
              transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <FaFilter size={14} className="text-white" />
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-40">
            <ContextMenuItem>Sort Ascending</ContextMenuItem>
            <ContextMenuItem>Sort Descending</ContextMenuItem>
            <ContextMenuItem>Clear Filters</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {/* Search input + icon */}
      <div className=" flex h-9 w-[240px] !mr-[1rem]">
        <Input
          type="text"
          placeholder="Search"
          className="rounded-r-none !rounded-l-sm !border !border-gray-300 !pl-4 !bg-white"
        />
        <div
          className="!bg-[#268094] !outline  outline-gray-200 flex items-center justify-center w-9 px-2 text-gray-500  border border-input rounded-r-sm shadow-xs 
          transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <FaSearch size={14} className="text-white" />
        </div>
      </div>

      {/* Long button that mimics input look */}
      <div className="ml-[-1rem]">
        <Link href="/create_user" className="!text-[#fff] rounded bg-[#268094] !p-2">Create New User</Link>
      </div>
    </div>
  );
}
