declare interface AuthResponse {
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

declare type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
};
declare interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

declare interface SidebarProps {
  name: string;
  email: string;
}

declare type Class = {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  students?: Student[];
};

declare type ClassInput = {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

declare type DeleteResponse = {
  message: string;
};

declare type Parent = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
};

declare type Class = {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};

declare type Student = {
  id: number;
  name: string;
  email: string;
  age: number;
  classId: string;
  parentId: number;
  createdAt: string;
  updatedAt: string;
  class?: Class;
  parent?: Parent;
};

declare type StudentInput = {
  name: string;
  email: string;
  age: number;
  classId: string;
  parentId: number;
};

declare type DeleteResponse = {
  message: string;
};

declare type Attendance = {
  id: string;
  studentId: number;
  classId: string;
  checkInTime: Date | string;
  checkOutTime?: Date | string | null;
  year: number;
  day: number;
  student?: Student;
  class?: Class;
};

declare type AttendanceByDay = {
  day: number;
  year: number;
  _count: {
    studentId: number;
  };
};

declare type StudentStatistics = {
  studentId: number;
  totalAttendance: number;
  absences: number;
  attendancePercentage: number;
};

declare type ClassStatistics = {
  classId: string;
  totalStudents: number;
  totalAttendance: number;
  attendanceRate: number;
};

declare type MonthlyReport = {
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
};

declare type WeeklyReport = MonthlyReport;

declare type AttendanceTrend = {
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
};

declare type ClassWiseAttendance = {
  attended: number;
  missed: number;
  attendancePercentage: number;
  attendanceRecords: AttendanceRecord[];
};

declare type LateVsOnTimeAttendance = {
  late: number;
  onTime: number;
};

declare type CheckInOutResponse = {
  message: string;
  attendance: Attendance;
};

declare interface ClassItem {
  id: string;
  name: string;
}

declare interface AttendanceRecord {
  id: string;
  studentId: number;
  studentName?: string;
  classId: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  date: string;
}

declare interface ClassWiseAttendanceResponse {
  className: string;
  attendanceRecords: AttendanceRecord[];
}

declare interface ChartDataItem {
  day: string;
  student: string;
  count: number;
}

declare interface DateRangeType {
  start: string;
  end: string;
}

declare interface StudentTableProps {
  students: Student[];
}

declare interface UserTableProps {
  users: User[];
}

declare interface AttendanceTableProps {
  students: Student[];
}

interface ClassItem {
  id: string;
  name: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  checkInTime: string;
  checkOutTime?: string;
}

interface ChartDataItem {
  period: string;
  attendance: number;
  date: string;
}

interface StudentStatistics {
  studentId: number;
  totalAttendance: number;
  absences: number;
  attendancePercentage: number;
}

interface AttendanceTableProps {
  students: Array<{
    id: number;
    name: string;
    // Add other student properties as needed
  }>;
}