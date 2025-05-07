// Role Enum
export enum Role {
    ADMIN = "ADMIN",
    SECURITY = "SECURITY",
  }


  export interface StatsTabsProps {
    totalStudents: number;
    totalClasses: number;
    attendanceToday: number;
  }


    export interface DashboardData {
      totalStudents: number;
      totalClasses: number;
      attendanceToday: number;
      recentAttendances: Attendance[];
      weeklyTrend: { day: string; attendance: number }[];
      classDistribution: { name: string; count: number }[];
      classAttendance: Record<string, { day: string; attendance: number }[]>; // Added to prevent TS error
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
    createdAt: Date;
    updatedAt: Date;
  } // picture prop

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
    id?: number; // Changed to match Int type
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
    // createdAt: Date;
    // updatedAt: Date;
  } //need to add student info email, phone 

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
    createdAt: Date;
    updatedAt: Date;
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
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Attendance Interface
  export interface Attendance {
    id: string;
    studentId: number; // Matches Student ID type
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
    student: Student;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // SMS Notification Interface
  export interface SMSNotification {
    id: string;
    studentId: number;
    parentId: string;
    status: string;
    message: string;
    sentAt: Date;
    student: Student;
    parent: Parent;
    createdAt: Date;
    updatedAt: Date;
  }
  