/**
 * Data models for the application
 * These interfaces represent the data structures used throughout the app
 */

export enum Role {
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY',
  TEACHER = 'TEACHER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum DayType {
  SCHOOL_DAY = 'SCHOOL_DAY',
  HOLIDAY = 'HOLIDAY',
  WEEKEND = 'WEEKEND',
  EXAM_DAY = 'EXAM_DAY',
  HALF_DAY = 'HALF_DAY'
}

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  website?: string;
  principal?: string;
  isActive: boolean;
  tenantKey: string;
  encryptionKey?: string;
  createdAt: Date;
  updatedAt: Date;
  classes?: Class[];
  students?: Student[];
  users?: User[];
  terms?: SchoolTerm[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: Role;
  picture?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  schoolId: string;
  school?: School;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolTerm {
  id: string;
  schoolId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  school?: School;
  schoolDays?: SchoolDay[];
  attendanceReports?: AttendanceReport[];
}

export interface SchoolDay {
  id: string;
  termId: string;
  date: Date;
  dayType: DayType;
  notes?: string;
  createdAt: Date;
  term?: SchoolTerm;
}

export interface AttendanceReport {
  id: string;
  studentId: string;
  termId: string;
  totalSchoolDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  attendanceRate: number;
  generatedAt: Date;
  student?: Student;
  term?: SchoolTerm;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  regNumber: string;
  admissionDate: Date;
  address: string;
  classId: string;
  parentId: string;
  schoolId: string;
  picture?: string;
  b2FileId?: string;
  b2FileName?: string;
  class?: Class;
  parent?: Parent;
  school?: School;
  qrCode?: QRCode;
  attendances?: Attendance[];
  attendanceReports?: AttendanceReport[];
  smsNotifications?: SMSNotification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  school?: School;
  students?: Student[];
  attendances?: Attendance[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  picture?: string;
  password?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  deviceToken?: string;
  enableCheckInNotifications: boolean;
  enableCheckOutNotifications: boolean;
  enableLateArrivalAlerts: boolean;
  enableAbsenceAlerts: boolean;
  students?: Student[];
  notifications?: Notification[];
  smsNotifications?: SMSNotification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  year: number;
  day: number;
  duration?: number;
  status: string;
  student?: Student;
  class?: Class;
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCode {
  id: string;
  code: string;
  studentId: string;
  url: string;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  student?: Student;
}

export interface SMSNotification {
  id: string;
  studentId: string;
  parentId: string;
  status: string;
  message: string;
  sentAt: Date;
  student?: Student;
  parent?: Parent;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  parentId: string;
  title: string;
  message: string;
  data?: string;
  read: boolean;
  readAt?: Date;
  sentAt: Date;
  createdAt?: Date;
  parent?: Parent;
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
  studentId?: string;
  classId?: string;
  date?: string;
  status?: 'present' | 'absent' | 'late';
}
