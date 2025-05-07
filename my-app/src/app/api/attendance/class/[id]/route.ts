// app/api/attendance/class/[classId]/route.ts
import { NextResponse } from 'next/server';
import { Class, Student, Attendance, ClassApiResponse, TransformedStudent } from '@/app/interface/testapi'; // Adjust the import path as necessary




export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
): Promise<NextResponse<ClassApiResponse>> {
  try {
    const classId = params.classId;
    
    if (!process.env.BACKEND_API_URL || !process.env.API_TOKEN) {
      throw new Error('Missing required environment variables');
    }
    
    const backendUrl = `${process.env.BACKEND_API_URL}/class/${classId}`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          success: false,
          error: errorData.message || `Failed to fetch class with ID: ${classId}` 
        },
        { status: response.status }
      );
    }
    
    const classData = await response.json() as Class;
    
    // Transform student data to match the expected format
    const students: TransformedStudent[] = classData.students.map((student: Student) => {
      // Calculate attendance stats
      const attendances = classData.attendances.filter(
        (a: Attendance) => a.studentId === student.id
      );
      
      // Count attendances, absences, and late arrivals
      const attendance = attendances.filter((a: Attendance) => a.checkInTime !== null).length;
      const absences = attendances.length - attendance;
      const late = attendances.filter((a: Attendance) => {
        if (!a.checkInTime) return false;
        
        // Define what "late" means - example: check-in after expected time
        const checkInTime = new Date(a.checkInTime);
        const classStartTime = new Date(checkInTime);
        classStartTime.setHours(9, 0, 0); // Assuming class starts at 9:00 AM
        return checkInTime > classStartTime;
      }).length;
      
      return {
        id: student.id,
        name: student.name,
        regNumber: student.id.toString(), // Convert to string since regNumber is expected as string
        attendance,
        absences,
        late,
        avatar: student.picture || '/api/placeholder/32/32',
        class: classData.name
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        classDetails: {
          id: classData.id,
          name: classData.name,
          description: classData.description
        },
        students
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching class:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}