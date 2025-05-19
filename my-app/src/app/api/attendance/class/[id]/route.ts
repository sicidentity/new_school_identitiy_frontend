// app/api/attendance/class/[classId]/route.ts
import { NextResponse } from 'next/server';
import { Class, Student, Attendance, ClassApiResponse, TransformedStudent } from '@/types'; // Adjust the import path as necessary

// Mock data for development
const mockClasses = {
  'c1': {
    id: 'c1',
    name: 'Mathematics',
    description: 'Advanced calculus and algebra',
    students: [
      { id: 1001, name: 'John Doe', picture: 'https://randomuser.me/api/portraits/men/1.jpg' },
      { id: 1002, name: 'Jane Smith', picture: 'https://randomuser.me/api/portraits/women/1.jpg' }
    ],
    attendances: [
      { id: 'a1', studentId: 1001, classId: 'c1', checkInTime: new Date(new Date().setHours(8, 50)).toISOString() },
      { id: 'a2', studentId: 1002, classId: 'c1', checkInTime: new Date(new Date().setHours(8, 45)).toISOString() },
      { id: 'a3', studentId: 1001, classId: 'c1', checkInTime: new Date(new Date().setHours(9, 5)).toISOString() },
      { id: 'a4', studentId: 1002, classId: 'c1', checkInTime: null }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'c2': {
    id: 'c2',
    name: 'Science',
    description: 'Physics and chemistry',
    students: [
      { id: 1003, name: 'Michael Johnson', picture: 'https://randomuser.me/api/portraits/men/2.jpg' },
      { id: 1004, name: 'Emily Williams', picture: 'https://randomuser.me/api/portraits/women/2.jpg' }
    ],
    attendances: [
      { id: 'a5', studentId: 1003, classId: 'c2', checkInTime: new Date(new Date().setHours(8, 40)).toISOString() },
      { id: 'a6', studentId: 1004, classId: 'c2', checkInTime: new Date(new Date().setHours(9, 10)).toISOString() },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'c3': {
    id: 'c3',
    name: 'History',
    description: 'World history',
    students: [
      { id: 1005, name: 'Robert Brown', picture: 'https://randomuser.me/api/portraits/men/3.jpg' },
      { id: 1006, name: 'Sarah Davis', picture: 'https://randomuser.me/api/portraits/women/3.jpg' }
    ],
    attendances: [
      { id: 'a7', studentId: 1005, classId: 'c3', checkInTime: new Date(new Date().setHours(8, 55)).toISOString() },
      { id: 'a8', studentId: 1006, classId: 'c3', checkInTime: null },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ClassApiResponse>> {
  try {
    const { id: classId } = await params;
    
    // In development mode, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log(`Using mock data for class ${classId}`);
      
      // Find the class in our mock data
      const classData = mockClasses[classId as keyof typeof mockClasses];
      
      if (!classData) {
        return NextResponse.json(
          { success: false, error: `Class with ID: ${classId} not found` },
          { status: 404 }
        );
      }
      
      // Transform student data to match the expected format
      const students: TransformedStudent[] = classData.students
        .map((student) => {
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
    }
    
    // If not in development, proceed with actual API calls
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
    const students: TransformedStudent[] = classData.students
      .filter((student: Student): student is Student & { id: number } => typeof student.id === 'number')
      .map((student: Student & { id: number }) => {
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
    
    // If in development mode, return mock data even on error
    if (process.env.NODE_ENV === 'development') {
      console.log(`Returning mock data after error for class`);
      
      // Use a default class ID if none found in params
      let classId;
      try {
        classId = (await params).id;
      } catch {
        classId = 'c1'; // Default to first class if params can't be read
      }
      
      // Find the class in our mock data
      const classData = mockClasses[classId as keyof typeof mockClasses] || mockClasses.c1;
      
      // Transform student data to match the expected format
      const students: TransformedStudent[] = classData.students
        .map((student) => {
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
    }
    
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