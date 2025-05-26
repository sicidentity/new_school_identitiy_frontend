import { Attendance, Class, ClassAttendanceData, DashboardAPIResponse, Student } from '@/types';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }
    
    const baseUrl = process.env.BACKEND_API_URL;
    console.log('Fetching dashboard data from:', baseUrl);

    // Fetch all required data
    const [classesRes, studentsRes, attendancesRes] = await Promise.all([
      fetch(`${baseUrl}/classes`, {
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }),
      fetch(`${baseUrl}/students`, {
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }),
      fetch(`${baseUrl}/attendance`, {
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      })
    ]);

    // Check if any of the requests failed
    if (!classesRes.ok || !studentsRes.ok || !attendancesRes.ok) {
      console.error('One or more API requests failed:');
      console.error(`Classes: ${classesRes.status} ${classesRes.statusText}`);
      console.error(`Students: ${studentsRes.status} ${studentsRes.statusText}`);
      console.error(`Attendance: ${attendancesRes.status} ${attendancesRes.statusText}`);
      throw new Error('Failed to fetch dashboard data');
    }

    // Parse the responses
    const classesData = await classesRes.json();
    const studentsData = await studentsRes.json();
    const attendancesData = await attendancesRes.json();

    // Extract the actual data arrays from the responses
    const classes: Class[] = classesData.data || [];
    const students: Student[] = studentsData.data || [];
    const allAttendances: Attendance[] = attendancesData.data || [];

    console.log(`Fetched ${classes.length} classes, ${students.length} students, and ${allAttendances.length} attendance records`);

    // Compute today's attendance count
    const today = new Date().toISOString().split('T')[0];
    const attendanceToday = allAttendances.filter(
      (a: Attendance) => a.checkInTime !== null && new Date(a.checkInTime as string | Date).toISOString().split('T')[0] === today
    ).length;

    // Compute class attendance data
    const classAttendance: ClassAttendanceData = {};

    classes.forEach((cls: Class) => {
      classAttendance[cls.name] = allAttendances
        .filter((a: Attendance) => a.classId === cls.id && a.checkInTime !== null)
        .map((a: Attendance) => {
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
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
