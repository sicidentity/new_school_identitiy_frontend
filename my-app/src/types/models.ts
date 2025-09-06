export enum Role {
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY',
  TEACHER = 'TEACHER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface School {
  id: string;                // UUID primary key
  name: string;
  code: string;              // Unique
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo?: string | null;
  website?: string | null;
  principal?: string | null;
  isActive: boolean;         // Defaults to true
  tenantKey: string;         // Unique, UUID, maps to 'tenant_key'
  encryptionKey?: string | null; // UUID, maps to 'encryption_key'
  createdAt: Date;           // Defaults to now, maps to 'created_at'
  updatedAt: Date;           // UpdatedAt field, maps to 'updated_at'
  classes: Class[];
  students: Student[];
  users: User[];
}

export interface User {
  id: string;                // UUID primary key
  role?: Role | null;        // Optional role enum
  email: string;             // Unique
  name: string;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  isEmailVerified: boolean;  // Defaults to false
  verificationCode?: string | null;
  verificationCodeExpiry?: Date | null;
  password: string;
  createdAt: Date;           // Defaults to now, maps to 'created_at'
  updatedAt: Date;           // UpdatedAt field, maps to 'updated_at'
  picture?: string | null;
  schoolId: string;          // Foreign key, maps to 'school_id'
  school?: School | null;    // Optional relation object

  // Indexes: schoolId, schoolId+email
}

export interface Student {
  id: string;                // UUID primary key
  name: string;
  age: number;
  classId: string;           // Foreign key, maps to 'class_id'
  parentId: string;          // Foreign key, maps to 'parent_id'
  picture?: string | null;
  createdAt: Date;           // Defaults to now, maps to 'created_at'
  updatedAt: Date;           // UpdatedAt field, maps to 'updated_at'
  address: string;
  admissionDate: Date;
  b2FileId?: string | null;
  b2FileName?: string | null;
  email: string;             // Unique
  phone: string;             // Unique
  regNumber: string;         // Unique
  schoolId: string;          // Foreign key, maps to 'school_id'
  attendances: Attendance[];
  qrCode?: QRCode | null;
  smsNotifications: SMSNotification[];
  class?: Class | null;
  parent?: Parent | null;
  school?: School | null;

  // Indexes: schoolId, schoolId+classId, schoolId+parentId, schoolId+regNumber 
}

export interface Class {
  id: string;                // UUID primary key
  name: string;
  description?: string | null;
  createdAt: Date;           // Defaults to now, maps to 'created_at'
  updatedAt: Date;           // UpdatedAt field, maps to 'updated_at'
  schoolId: string;          // Foreign key, maps to 'school_id'
  attendances: Attendance[];
  school?: School | null;
  students: Student[];

  // Indexes: schoolId, schoolId+name
}

export interface Parent {
  id: string;                // UUID primary key
  name: string;
  phone: string;             // Unique
  email: string;             // Unique
  address: string;
  picture?: string | null;
  deviceToken?: string | null; // Maps to 'device_token'
  createdAt: Date;           // Defaults to now, maps to 'created_at'
  updatedAt: Date;           // UpdatedAt field, maps to 'updated_at'
  notifications?: Notification[];
  smsNotifications: SMSNotification[];
  students: Student[];

  // Table maps to 'parents'
}

export interface Attendance {
  id: string;                // UUID primary key
  studentId: string;         // Foreign key, maps to 'student_id'
  classId: string;           // Foreign key, maps to 'class_id'
  checkInTime?: Date | null; // Maps to 'check_in_time'
  checkOutTime?: Date | null;// Maps to 'check_out_time'
  year: number;
  duration?: number | null;
  day: number;
  createdAt: Date;           // Defaults to now, maps to 'created_at'
  updatedAt: Date;           // UpdatedAt field, maps to 'updated_at'
  status: string;            // Defaults to "present"
  class: Class;
  student: Student;

  // Indexes: studentId, classId, studentId+year
  // Table maps to 'attendances'
}

export interface QRCode {
  id: string;                // UUID primary key
  studentId: string;         // Unique foreign key
  code: string;              // Unique
  url: string;
  validUntil: Date;
  createdAt: Date;           // Defaults to now
  updatedAt: Date;           // UpdatedAt field
  student: Student;

  // Indexes: studentId
  // Table maps to 'qr_codes'
}

export interface SMSNotification {
  id: string;                // UUID primary key
  studentId: string;         // Foreign key, maps to 'student_id'
  parentId: string;          // Foreign key, maps to 'parent_id'
  status: string;
  message: string;
  sentAt: Date;              // Defaults to now, maps to 'sent_at'
  createdAt: Date;           // Defaults to now, maps to 'created_at'
  updatedAt: Date;           // UpdatedAt field, maps to 'updated_at'
  parent: Parent;
  student: Student;

  // Indexes: studentId, parentId
  // Table maps to 'sms_notifications'
}

export interface Notification {
  id: string;                // UUID primary key
  parentId: string;          // Foreign key, maps to 'parent_id'
  title: string;
  message: string;
  data?: string | null;
  read: boolean;             // Defaults to false
  sentAt: Date;              // Defaults to now
  readAt?: Date | null;
  parent: Parent;

  // Indexes: parentId, parentId+read
  // Table maps to 'notifications'
}


// API Response structures
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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