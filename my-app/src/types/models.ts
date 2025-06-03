/**
 * Data models for the application
 * These interfaces represent the data structures used throughout the app
 */

export enum Role {
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: Role;
  picture?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: number; // 7-digit numeric ID
  name: string;
  age: number;
  phone: string;
  email: string;
  regNumber: string;
  admissionDate: Date;
  address: string;
  classId: string;
  parentId: string;
  picture?: string;
  b2FileId?: string;
  b2FileName?: string;
  class: Class;
  parent: Parent;
  qrCodes: QRCode[];
  attendances: Attendance[];
  smsNotifications: SMSNotification[];
  createdAt: Date;
  updatedAt: Date;
}


export interface Class {
  id: string;
  name: string;
  description?: string;
  students: Student[];
  attendances: Attendance[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  students: Student[];
  smsNotifications: SMSNotification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  year: number;
  day: number;
  student: Student;
  class: Class;
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCode {
  id: string;
  code: string;
  studentId: string;
  student: Student;
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSNotification {
  id: string;
  studentId: string;
  parentId: string;
  status: string;
  message: string;
  sentAt: Date;
  student: Student;
  parent: Parent;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentQueryParams extends PaginationParams {
  classId?: string;
  search?: string;
}

export interface AttendanceQueryParams extends PaginationParams {
  studentId?: number;
  classId?: string;
  date?: string;
  status?: 'present' | 'absent' | 'late';
}
