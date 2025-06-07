// components/ui/multiselect.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  label: string;
  value: string;
  [key: string]: any; // Allows additional fields like email
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  renderOption?: (option: MultiSelectOption, selected: boolean) => React.ReactNode;
}

export const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  className,
  disabled = false,
  renderOption,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.email && option.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [options, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const selectedLabels = useMemo(() => {
    return options
      .filter(option => value.includes(option.value))
      .map(option => option.label)
      .join(", ");
  }, [value, options]);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        className={cn(
          "group flex w-full items-center justify-between rounded-xl border-2 border-slate-200/60 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium shadow-sm transition-all duration-200",
          "hover:border-teal-300/60 hover:bg-white hover:shadow-md",
          "focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400",
          isOpen && "border-teal-400 bg-white shadow-lg ring-4 ring-teal-500/20",
          disabled && "cursor-not-allowed opacity-50 hover:border-slate-200/60 hover:bg-white/80 hover:shadow-sm",
          value.length > 0 && "border-teal-300/80 bg-teal-50/30"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={cn(
          "truncate transition-colors duration-200",
          value.length > 0 ? "text-slate-800" : "text-slate-500"
        )}>
          {value.length > 0 ? selectedLabels : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-teal-500 text-white text-xs font-semibold rounded-full">
              {value.length}
            </span>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-slate-400 transition-all duration-200",
            "group-hover:text-slate-600",
            isOpen && "rotate-180 text-teal-500"
          )} />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200/80 bg-white shadow-xl backdrop-blur-sm animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          {/* Search input */}
          <div className="sticky top-0 border-b border-slate-100 bg-white/95 backdrop-blur-sm p-3 rounded-t-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/80 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  className="absolute right-3 p-1 hover:bg-slate-200/60 rounded-md transition-colors duration-150"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300/50 scrollbar-track-transparent">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "group cursor-pointer px-4 py-3 text-sm transition-all duration-150",
                      "hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-blue-50/40",
                      "border-b border-slate-50 last:border-b-0",
                      isSelected && "bg-gradient-to-r from-teal-50 to-emerald-50/50 border-teal-100"
                    )}
                    onClick={() => toggleOption(option.value)}
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all duration-200",
                          isSelected 
                            ? "bg-teal-500 border-teal-500 shadow-sm" 
                            : "border-slate-300 group-hover:border-teal-400"
                        )}>
                          <Check
                            className={cn(
                              "h-3 w-3 text-white transition-all duration-200",
                              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "block font-medium transition-colors duration-150",
                            isSelected ? "text-teal-800" : "text-slate-700 group-hover:text-slate-900"
                          )}>
                            {option.label}
                          </span>
                          {option.email && (
                            <p className={cn(
                              "text-xs mt-0.5 transition-colors duration-150",
                              isSelected ? "text-teal-600" : "text-slate-500 group-hover:text-slate-600"
                            )}>
                              {option.email}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="text-slate-400 mb-1">
                  <Search className="h-8 w-8 mx-auto opacity-40" />
                </div>
                <p className="text-sm text-slate-500 font-medium">No options found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>

          {/* Selected count */}
          {value.length > 0 && (
            <div className="sticky bottom-0 border-t border-slate-100 bg-gradient-to-r from-teal-50/80 to-emerald-50/40 backdrop-blur-sm px-4 py-2.5 rounded-b-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-teal-700">
                  {value.length} item{value.length === 1 ? '' : 's'} selected
                </span>
                <button
                  onClick={() => onChange([])}
                  className="text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors duration-150 hover:underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};