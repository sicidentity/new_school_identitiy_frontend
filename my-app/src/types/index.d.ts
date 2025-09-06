import { ColumnDef } from "@tanstack/react-table";
import { IconType } from "react-icons";
export enum Role {
  ADMIN = "ADMIN",
  SECURITY = "SECURITY",
}

export interface StudentApiResponse {
  success: boolean;
  data?: {
    studentDetails: {
      id: string;
      name: string;
      age: number;
      classId: string;
      parentId: string;
      picture?: string;
    };
    class: Class;
    parent: Parent;
  };
  error?: string;
  timestamp?: string;
}

export interface ParentApiResponse {
  success: boolean;
  data?: {
    parentDetails: {
      id: string;
      name: string;
      phone: string;
      email: string;
    };
    students: Student[];
  };
  error?: string;
  timestamp?: string;
}

// From testapi.ts
export interface StatsTabsProps {
  totalStudents: number;
  totalClasses: number;
  attendanceToday: number;
}

declare interface DashboardData {
  totalStudents: number;
  totalClasses: number;
  attendanceToday: number;
  recentAttendances: Attendance[];
  weeklyTrend: { day: string; attendance: number }[];
  classDistribution: { name: string; count: number }[];
  classAttendance: Record<string, { day: string; attendance: number }[]>;
}

// User Interface
export interface User {
  id: string;
  role?: Role;
  email: string;
  name: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  password: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsersResponse {
  success: boolean;
  data?: User[];
  error?: string;
  timestamp?: string;
}

export interface UserApiResponse {
  success: boolean;
  data?: User[];
  error?: string;
  timestamp?: string;
}

// Student Interface
export interface Student {
  id?: number;
  name: string;
  age: number;
  classId: string;
  parentId: string;
  picture?: string;
  class: Class;
  parent: Parent;
  qrCodes: QRCode[];
  attendances: Attendance[];
  smsNotifications: SMSNotification[];
}

type StudentOptionMultiSelect = {
  label: string
  value: string
  email: string
}


export interface StudentRequest {
  name: string;
  age: number;
  classId: string;
  parentId: string;
  picture?: string;
  studentInfo: {
    email: string;
    phone: string;
  };
  parentInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface TransformedStudent {
  id: number;
  name: string;
  regNumber: string;
  attendance: number;
  absences: number;
  late: number;
  avatar: string;
  class: string;
}

// Class Interface
export interface Class {
  id: string;
  name: string;
  description?: string;
  students: Student[];
  attendances: Attendance[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ClassesResponse {
  success: boolean;
  data: Class[];
  timestamp?: string;
  error?: string;
}

export interface ClassApiResponse {
  success: boolean;
  data?: {
    classDetails: {
      id: string;
      name: string;
      description?: string;
    };
    students: TransformedStudent[];
  };
  error?: string;
  timestamp?: string;
}

export interface DashboardAPIResponse {
  success: boolean;
  totalStudents: number;
  totalClasses: number;
  attendanceToday: number;
  classAttendance: ClassAttendanceData;
  recentAttendances: Attendance[];
  timestamp: string;
}

// Parent Interface
export interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  students: Student[];
  smsNotifications: SMSNotification[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Attendance Interface
export interface Attendance {
  id: string;
  studentId: number;
  classId: string;
  checkInTime: Date | string | null;
  checkOutTime?: Date | string;
  year?: number;
  day?: number;
  student?: Student;
  class?: Class;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ClassAttendanceData {
  [className: string]: {
    day: string;
    attendance: number;
  }[];
}

// QRCode Interface
export interface QRCode {
  id: string;
  code: string;
  studentId: number;
  url: string;
  student: Student;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// SMS Notification Interface
export interface SMSNotification {
  id: string;
  studentId: number;
  parentId: string;
  status: string;
  message: string;
  sentAt: Date | string;
  student: Student;
  parent: Parent;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// From dashboard.ts
export interface SidebarItem {
  title: string;
  url: string;
  icon: IconType; // From react-icons
}

export interface SidebarProps {
  items: SidebarItem[];
  user: {
    avatarUrl: string;
    name: string;
    email: string;
  };
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface DashboardStudent {
  id: string;
  name: string;
  class: string;
  regNumber: string;
  attendance: number;
  absences: number;
  late: number;
  avatar?: string;
  admissionDate?: string;
  email?: string;
  phone?: string;
  parentEmail?: string;
  parentPhone?: string;
  studentInfo?: ContactInfo;
  parentInfo?: ContactInfo;
}

export interface StudentFormValues {
  name: string;
  class: string;
  email: string;
  phone: string;
  parentEmail: string;
  parentPhone: string;
}

export interface StudentRowProps {
  row: DashboardStudent;
  classId: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  title?: string;
  onRowClick?: (rowData: TData) => void;
} 

declare interface AuthResponse {
  error: string | undefined;
  token?: string;
  user?: {
    name: string;
    email: string;
  };
  message?: string;
}

declare interface ForgotPasswordResponse {
  message: string;
}

declare interface ResetPasswordResponse {
  message: string;
}

declare type LoggedInContextType = {
  isLoggedIn: boolean;
};

declare type ParamProps = {
  params: {
    token: string;
  };
};

declare type CardParamProps = {
  params: {
    studentId: string;
  };
};

declare type VerifyEmailResponse = {
  success: boolean;
  message: string;
};

declare type UserResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

declare type CreateQrCodeResponse = {
  studentId: string;
  qrCode: QRCodeData;
};

declare type Student = {
  id: number;
  name: string;
  email: string;
  age: number;
  picture: string;
  classId: string;
  parentId: number;
  createdAt: string;
  updatedAt: string;
  class?: Class;
  parent?: Parent;
  qrCode: QRCodeData;
};

declare interface QRCodeData {
  id: string;
  code: string;
  url: string;
  studentId: string;
  validUntil: string;
}

declare interface CreateQrCodeResponse {
  message: string;
  qrCode: QRCodeData;
}

declare interface GetQrCodeResponse {
  qrCode: string;
  url: string;


  //added lines
   validUntil?: string;
  id?: string;
  studentId?: string;
}

