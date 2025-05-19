import { Attendance } from '@/types';
import { NextResponse } from 'next/server';

// Mock data for development
const mockStudent = {
  id: '12345',
  name: 'John Doe',
  regNumber: 'STU2023001',
  picture: 'https://randomuser.me/api/portraits/men/1.jpg',
  class: { name: 'Mathematics' }
};

const mockAttendance: Attendance[] = [
  {
    id: 'att1',
    studentId: 12345,
    classId: 'c1',
    checkInTime: new Date(new Date().setHours(7, 45)).toISOString(),
  },
  {
    id: 'att2',
    studentId: 12345,
    classId: 'c1',
    checkInTime: new Date(new Date().setHours(7, 50)).toISOString(),
  },
  {
    id: 'att3',
    studentId: 12345,
    classId: 'c1',
    checkInTime: new Date(new Date().setHours(8, 15)).toISOString(),
  },
  {
    id: 'att4',
    studentId: 12345,
    classId: 'c1',
    checkInTime: new Date(new Date().setHours(7, 40)).toISOString(),
  },
  {
    id: 'att5',
    studentId: 12345,
    classId: 'c1',
    checkInTime: new Date(new Date().setHours(9, 10)).toISOString(),
  },
];

export async function GET(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for student attendance');
      
      // Transform the student into TransformedStudent shape
      const transformedStudent = {
        id: mockStudent.id,
        name: mockStudent.name,
        regNumber: mockStudent.regNumber || 'N/A',
        attendance: mockAttendance.length,
        absences: 0,
        late: mockAttendance.filter((a) => {
          if (!a.checkInTime) return false;
          // Type assertion to tell TypeScript that checkInTime is not null
          const checkInTime = a.checkInTime as string | Date;
          const checkIn = new Date(checkInTime).getHours();
          return checkIn > 8; // late if after 8AM
        }).length,
        avatar: mockStudent.picture || '',
        class: mockStudent.class.name
      };

      return NextResponse.json({
        success: true,
        data: {
          student: transformedStudent,
          attendance: mockAttendance
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // If not in development, fetch from your backend
    const backendRes = await fetch(`${process.env.BACKEND_BASE_URL}/students/${studentId}`);
    const backendJson = await backendRes.json();

    if (!backendRes.ok || !backendJson.success) {
      return NextResponse.json(
        { success: false, error: backendJson.error || 'Failed to fetch student' },
        { status: backendRes.status }
      );
    }

    const student = backendJson.data.student;
    const attendance = backendJson.data.attendance;

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
      class: student.class.name
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
    
    // In development, return mock data even on error
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock data after error');
      
      // Transform the student into TransformedStudent shape
      const transformedStudent = {
        id: mockStudent.id,
        name: mockStudent.name,
        regNumber: mockStudent.regNumber || 'N/A',
        attendance: mockAttendance.length,
        absences: 0,
        late: mockAttendance.filter((a) => {
          if (!a.checkInTime) return false;
          // Type assertion to tell TypeScript that checkInTime is not null
          const checkInTime = a.checkInTime as string | Date;
          const checkIn = new Date(checkInTime).getHours();
          return checkIn > 8; // late if after 8AM
        }).length,
        avatar: mockStudent.picture || '',
        class: mockStudent.class.name
      };

      return NextResponse.json({
        success: true,
        data: {
          student: transformedStudent,
          attendance: mockAttendance
        },
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
