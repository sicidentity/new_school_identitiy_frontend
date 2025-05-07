import { Attendance, Class, ClassAttendanceData, DashboardAPIResponse, Student } from '@/app/interface/testapi';
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

export async function GET() {
  try {
    const baseUrl = process.env.BACKEND_API_URL;
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
      (a) => new Date(a.checkInTime).toISOString().split('T')[0] === today
    ).length;

    // Compute class attendance data
    const classAttendance: ClassAttendanceData = {};

    classes.forEach((cls) => {
      classAttendance[cls.name] = allAttendances
        .filter((a) => a.classId === cls.id)
        .map((a) => ({
          day: new Date(a.checkInTime).toISOString(),
          attendance: cls.students?.length || 0
        }));
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
