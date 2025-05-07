import { Attendance } from '@/app/interface/testapi';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, context: { params: { studentId: string } }) {
  const { studentId } = context.params;

  try {
    // Fetch from your backend
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
        const checkIn = new Date(a.checkInTime).getHours();
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
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
