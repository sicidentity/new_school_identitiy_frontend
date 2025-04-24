'use client';

import { FaFilter, FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

export default function FilterSearchBar() {
  return (
    <div className="flex items-center gap-1 justify-end pr-4">
      
      {/* Filter input + icon */}
      <div className="flex h-9 w-[240px]">
        <Input
          type="text"
          placeholder="Filter Data"
          className="rounded-r-none !rounded-l-sm border-r-0 !bg-emerald-800"
        />
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className="flex items-center justify-center w-9 px-2 text-gray-500 bg-emerald-600 border border-input rounded-r-sm shadow-xs 
              transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <FaFilter size={14} />
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
      <div className=" flex h-9 w-[240px]">
        <Input
          type="text"
          placeholder="Search"
          className="rounded-r-none !rounded-l-sm !bg-amber-600 border-r-0"
        />
        <div
          className="!bg-amber-800 flex items-center justify-center w-9 px-2 text-gray-500  border border-input rounded-r-sm shadow-xs 
          transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <FaSearch size={14} />
        </div>
      </div>

      {/* Long button that mimics input look */}
      <Button
        className="h-9 px-4 w-[25%] !rounded-md !bg-amber-700 !hover:bg-green-600 text-white  shadow-xs transition-all border border-input focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        variant="green"
      >
        Create New User
      </Button>
    </div>
  );
}
