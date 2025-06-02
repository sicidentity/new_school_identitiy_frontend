import { NextResponse } from 'next/server';
import { Attendance } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;


  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }
    
    const backendUrl = `${process.env.BACKEND_API_URL}/students/${studentId}`;
    console.log('Fetching student from for the student detail:', backendUrl);
    
    const backendRes = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!backendRes.ok) {
      console.error('Backend response not OK:', backendRes.status, backendRes.statusText);
      const errorText = await backendRes.text();
      console.error('Error response body:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { 
            success: false,
            error: errorData.message || `Failed to fetch student with ID: ${studentId}`,
            status: backendRes.status 
          },
          { status: backendRes.status }
        );
      } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return NextResponse.json(
          { 
            success: false,
            error: `Failed to fetch student: ${backendRes.statusText}`,
            status: backendRes.status 
          },
          { status: backendRes.status }
        );
      }
    }
    
    const student = await backendRes.json();
    console.log('Student data from backend:', student);
    
    // The backend API returns the student object directly, not wrapped in a data.student property
    // We need to fetch the attendance data separately
    
    // Fetch attendance records for this student
    const attendanceUrl = `${process.env.BACKEND_API_URL}/attendance/student/${studentId}`;
    console.log('Fetching attendance from:', attendanceUrl);
    
    // Default to empty array for attendance
    let attendance = [];
    
    try {
      const attendanceRes = await fetch(attendanceUrl, {
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (!attendanceRes.ok) {
        console.log(`Attendance endpoint returned ${attendanceRes.status}. Using empty attendance data.`);
      } else {
        // Endpoint succeeded
        const attendanceData = await attendanceRes.json();
        attendance = attendanceData.data || [];
        console.log('Attendance data retrieved successfully');
      }
      
      // Log whether the attendance array is empty
      if (attendance.length === 0) {
        console.log('Attendance array is empty');
      } else {
        console.log(`Found ${attendance.length} attendance records for student ${studentId}`);
      }
    } catch (e) {
      console.error('Error fetching attendance data:', e);
      console.log('Using empty attendance array due to error');
    }

    // Transform the student into TransformedStudent shape
    const transformedStudent = {
      id: student.id,
      name: student.name,
      regNumber: student.regNumber || 'N/A',
      attendance: attendance.length,
      absences: attendance.filter((a: Attendance) => !a.checkInTime).length,
      late: attendance.filter((a: Attendance) => {
        if (!a.checkInTime) return false;
        // Type assertion to tell TypeScript that checkInTime is not null
        const checkInTime = a.checkInTime as string | Date;
        const checkIn = new Date(checkInTime).getHours();
        return checkIn > 8; // late if after 8AM, adjust as needed
      }).length,
      avatar: student.picture || '',
      class: student.class?.name || 'Unknown Class'
    };

    return NextResponse.json({
      success: true,
      data: {
        student: transformedStudent,
        attendance
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error fetching student data:', err);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
