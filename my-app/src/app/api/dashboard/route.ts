import { Attendance, Class, ClassAttendanceData, DashboardAPIResponse, Student } from '@/types';
import { NextResponse } from 'next/server';

// interface ClassAttendanceData {
//   [className: string]: {
//     day: string;
//     attendance: number;
//   }[];
// }

// interface Student {
//   id: number;
//   name: string;
//   classId: string;
// }

// interface Class {
//   id: string;
//   name: string;
//   description?: string;
//   students: Student[];
//   createdAt: string;
//   updatedAt: string;
// }

// interface Attendance {
//   id: string;
//   studentId: number;
//   classId: string;
//   checkInTime: string;
//   checkOutTime?: string;
// }

// interface DashboardAPIResponse {
//   success: boolean;
//   totalStudents: number;
//   totalClasses: number;
//   attendanceToday: number;
//   classAttendance: ClassAttendanceData;
//   recentAttendances: Attendance[];
//   timestamp: string;
// }

// Mock data for development
const mockClasses: Class[] = [
  {
    id: 'c1',
    name: 'Mathematics',
    description: 'Advanced calculus and algebra',
    students: [],
    attendances: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Science',
    description: 'Physics and chemistry',
    students: [],
    attendances: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    name: 'History',
    description: 'World history',
    students: [],
    attendances: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Create a mock Parent to use in Student objects
const mockParent = {
  id: 'p1',
  name: 'Parent Name',
  email: 'parent@example.com',
  phone: '123-456-7890',
  students: [],
  smsNotifications: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockStudents: Student[] = [
  { 
    id: 1001, 
    name: 'John Doe', 
    classId: 'c1',
    age: 10,
    parentId: 'p1',
    class: { ...mockClasses[0], students: [] },
    parent: mockParent,
    qrCodes: [],
    attendances: [],
    smsNotifications: []
  },
  { 
    id: 1002, 
    name: 'Jane Smith', 
    classId: 'c1',
    age: 10,
    parentId: 'p1',
    class: { ...mockClasses[0], students: [] },
    parent: mockParent,
    qrCodes: [],
    attendances: [],
    smsNotifications: []
  },
  { 
    id: 1003, 
    name: 'Michael Johnson', 
    classId: 'c2',
    age: 11,
    parentId: 'p1',
    class: { ...mockClasses[1], students: [] },
    parent: mockParent,
    qrCodes: [],
    attendances: [],
    smsNotifications: []
  },
  { 
    id: 1004, 
    name: 'Emily Williams', 
    classId: 'c2',
    age: 11,
    parentId: 'p1',
    class: { ...mockClasses[1], students: [] },
    parent: mockParent,
    qrCodes: [],
    attendances: [],
    smsNotifications: []
  },
  { 
    id: 1005, 
    name: 'Robert Brown', 
    classId: 'c3',
    age: 12,
    parentId: 'p1',
    class: { ...mockClasses[2], students: [] },
    parent: mockParent,
    qrCodes: [],
    attendances: [],
    smsNotifications: []
  },
  { 
    id: 1006, 
    name: 'Sarah Davis', 
    classId: 'c3',
    age: 12,
    parentId: 'p1',
    class: { ...mockClasses[2], students: [] },
    parent: mockParent,
    qrCodes: [],
    attendances: [],
    smsNotifications: []
  },
];

// Add students to classes
mockClasses.forEach(cls => {
  cls.students = mockStudents.filter(s => s.classId === cls.id);
});

const mockAttendances: Attendance[] = [
  {
    id: 'a1',
    studentId: 1001,
    classId: 'c1',
    checkInTime: new Date().toISOString(),
  },
  {
    id: 'a2',
    studentId: 1002,
    classId: 'c1',
    checkInTime: new Date().toISOString(),
  },
  {
    id: 'a3',
    studentId: 1003,
    classId: 'c2',
    checkInTime: new Date().toISOString(),
  },
  {
    id: 'a4',
    studentId: 1004,
    classId: 'c2',
    checkInTime: new Date().toISOString(),
  },
  {
    id: 'a5',
    studentId: 1005,
    classId: 'c3',
    checkInTime: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    // Check if we're in development mode or don't have a backend URL
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = process.env.BACKEND_API_URL;
    
    // Return mock data if we're in development or don't have a backend URL
    if (isDev || !baseUrl) {
      console.log('Using mock data for dashboard');
      
      // Compute class attendance data from mock data
      const classAttendance: ClassAttendanceData = {};
      mockClasses.forEach((cls) => {
        classAttendance[cls.name] = mockAttendances
          .filter((a) => a.classId === cls.id && a.checkInTime !== null)
          .map((a) => {
            // Type assertion to tell TypeScript that checkInTime is not null here
            const checkInTime = a.checkInTime as string | Date;
            return {
              day: new Date(checkInTime).toISOString(),
              attendance: cls.students?.length || 0
            };
          });
      });

      const response: DashboardAPIResponse = {
        success: true,
        totalStudents: mockStudents.length,
        totalClasses: mockClasses.length,
        attendanceToday: mockAttendances.length,
        classAttendance,
        recentAttendances: mockAttendances,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    }

    // If we're not in development mode, proceed with actual API calls
    const authToken = process.env.API_TOKEN;
    const headers = { Authorization: `Bearer ${authToken}` };

    // Fetch all required data
    const [classesRes, studentsRes, attendancesRes] = await Promise.all([
      fetch(`${baseUrl}/classes`, { headers }),
      fetch(`${baseUrl}/students`, { headers }),
      fetch(`${baseUrl}/attendance`, { headers })
    ]);

    if (!classesRes.ok || !studentsRes.ok || !attendancesRes.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const classes: Class[] = await classesRes.json();
    const students: Student[] = await studentsRes.json();
    const allAttendances: Attendance[] = await attendancesRes.json();

    // Compute today's attendance count
    const today = new Date().toISOString().split('T')[0];
    const attendanceToday = allAttendances.filter(
      (a) => a.checkInTime !== null && new Date(a.checkInTime as string | Date).toISOString().split('T')[0] === today
    ).length;

    // Compute class attendance data
    const classAttendance: ClassAttendanceData = {};

    classes.forEach((cls) => {
      classAttendance[cls.name] = allAttendances
        .filter((a) => a.classId === cls.id && a.checkInTime !== null)
        .map((a) => {
          // Type assertion to tell TypeScript that checkInTime is not null here
          const checkInTime = a.checkInTime as string | Date;
          return {
            day: new Date(checkInTime).toISOString(),
            attendance: cls.students?.length || 0
          };
        });
    });

    const response: DashboardAPIResponse = {
      success: true,
      totalStudents: students.length,
      totalClasses: classes.length,
      attendanceToday,
      classAttendance,
      recentAttendances: allAttendances.slice(0, 10),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Dashboard API Error:', error);
    
    // If there's an error in production, return error response
    // In development, return mock data even on error
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock data after error');
      
      // Compute class attendance data from mock data
      const classAttendance: ClassAttendanceData = {};
      mockClasses.forEach((cls) => {
        classAttendance[cls.name] = mockAttendances
          .filter((a) => a.classId === cls.id && a.checkInTime !== null)
          .map((a) => {
            // Type assertion to tell TypeScript that checkInTime is not null here
            const checkInTime = a.checkInTime as string | Date;
            return {
              day: new Date(checkInTime).toISOString(),
              attendance: cls.students?.length || 0
            };
          });
      });

      const response: DashboardAPIResponse = {
        success: true,
        totalStudents: mockStudents.length,
        totalClasses: mockClasses.length,
        attendanceToday: mockAttendances.length,
        classAttendance,
        recentAttendances: mockAttendances,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
