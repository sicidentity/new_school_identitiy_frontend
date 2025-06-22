import { NextResponse } from 'next/server';
import type { Attendance } from '@/types';

export async function GET() {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }
    
    const baseUrl = process.env.BACKEND_API_URL;
    console.log('Fetching dashboard data from:', baseUrl);

    // Fetch all required data
    const [classesRes, studentsRes, attendancesRes] = await Promise.all([
      fetch(`${baseUrl}/classes`, { cache: 'no-store' }),
      fetch(`${baseUrl}/students`, { cache: 'no-store' }),
      fetch(`${baseUrl}/attendance`, { cache: 'no-store' })
    ]);

    // Check if any of the requests failed
    if (!classesRes.ok || !studentsRes.ok || !attendancesRes.ok) {
      console.error('One or more API requests failed:', {
        classes: classesRes.status,
        students: studentsRes.status,
        attendance: attendancesRes.status
      });
      throw new Error('Failed to fetch dashboard data');
    }

    // Parse the responses - note: your backend returns the array directly, not wrapped in a data property
    const classes = await classesRes.json();
    const students = await studentsRes.json();
    const allAttendances = await attendancesRes.json();

    console.log(`Fetched ${classes.length} classes, ${students.length} students, and ${allAttendances.length} attendance records`);

    // Compute today's attendance count
    const today = new Date().toISOString().split('T')[0];
    const attendanceToday = allAttendances.filter(
      (a: Attendance) => a.checkInTime && new Date(a.checkInTime as string).toISOString().split('T')[0] === today
    ).length;

    // Compute class attendance data
    const classAttendance: Record<string, { day: string; attendance: number }[]> = {};

    // First, get unique class names
    const classNames: string[] = [...new Set(allAttendances.map((a: Attendance) => a.class?.name).filter(Boolean) as string[])];
    
    // Initialize class attendance with empty arrays
    classNames.forEach((className) => {
      classAttendance[className] = [];
    });

    // For each class, count attendances per day
    classNames.forEach((className) => {
      const classAttendances = allAttendances.filter((a: Attendance) => a.class?.name === className);
      
      // Group by day
      const attendancesByDay: Record<string, number> = {};
      classAttendances.forEach((att: Attendance)=> {
        if (att.checkInTime) {
          const day = new Date(att.checkInTime).toISOString().split('T')[0];
          attendancesByDay[day] = (attendancesByDay[day] || 0) + 1;
        }
      });
      
      // Convert to array format expected by the chart
      classAttendance[className] = Object.entries(attendancesByDay).map(([day, count]) => ({
        day,
        attendance: count
      }));
    });

    const response = {
      success: true,
      totalStudents: students.length,
      totalClasses: classes.length,
      attendanceToday,
      classAttendance,
      recentAttendances: allAttendances
        .sort((a: Attendance, b: Attendance) => 
          new Date(b.checkInTime as string).getTime() - new Date(a.checkInTime as string).getTime()
        )
        .slice(0, 10)
        .map((a: Attendance) => ({
          id: a.id,
          studentId: a.studentId,
          classId: a.classId,
          checkInTime: a.checkInTime,
          checkOutTime: a.checkOutTime,
          student: a.student,
          class: a.class
        })),
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
