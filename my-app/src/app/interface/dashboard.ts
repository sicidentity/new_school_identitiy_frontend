import { ColumnDef } from "@tanstack/react-table";
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

interface ContactInfo {
  email: string
  phone: string
}
export type Student = {
  id: string;
  name: string;
  class: string;
  regNumber: string;
  attendance: number;
  absences: number;
  late: number;
  avatar?: string;          // URL for the student's avatar image
  admissionDate?: string;   // Date of admission in ISO format (e.g., "2023-05-01")

  // Optional contact details
  email?: string;
  phone?: string;
  parentEmail?: string;
  parentPhone?: string;
  studentInfo?: ContactInfo
  parentInfo?: ContactInfo
}

export type StudentFormValues = {
  name: string;
  class: string;
  email: string;
  phone: string;
  parentEmail: string;
  parentPhone: string;
};




export type StudentRowProps = {
  row: Student;
  classId: string;
};

export interface AttendanceRecord {
  id: string;
  date: string;         // ISO format (e.g., "2023-05-01")
  checkIn: string;      // Time format (e.g., "08:15 AM")
  checkOut: string;     // Time format (e.g., "03:30 PM")
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;     // Optional field
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterColumn?: string
  filterPlaceholder?: string
  title?: string
  onRowClick?: (rowData: TData) => void // ✅ NEW
}