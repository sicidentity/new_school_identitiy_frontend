// src/app/dashboard/attendance/[classId]/[studentId]/data.ts
import { AttendanceRecord } from '@/app/interface/dashboard';

const sampleAttendanceData: AttendanceRecord[] = [
  {
    id: 'attn-001',
    date: '2023-05-01',
    checkIn: '08:15 AM',
    checkOut: '03:30 PM',
    status: 'Present',
    remarks: 'On time'
  },
  {
    id: 'attn-002',
    date: '2023-05-02',
    checkIn: '09:05 AM',
    checkOut: '03:25 PM',
    status: 'Late',
    remarks: 'Traffic delay'
  },
  {
    id: 'attn-003',
    date: '2023-05-03',
    checkIn: '--',
    checkOut: '--',
    status: 'Absent',
    remarks: 'Sick leave'
  },
  {
    id: 'attn-004',
    date: '2023-05-04',
    checkIn: '08:10 AM',
    checkOut: '03:45 PM',
    status: 'Present'
  },
  {
    id: 'attn-005',
    date: '2023-05-05',
    checkIn: '08:55 AM',
    checkOut: '03:20 PM',
    status: 'Late'
  },
];

export function getAttendanceData(): AttendanceRecord[] {
  return sampleAttendanceData;
}

// You could also add more functions here to manipulate the data
// For example:
export function getStudentAttendanceSummary() {
  // This is just a placeholder - in a real app, you'd filter by student ID
  const totalRecords = sampleAttendanceData.length;
  const present = sampleAttendanceData.filter(record => record.status.toLowerCase() === 'present').length;
  const absent = sampleAttendanceData.filter(record => record.status.toLowerCase() === 'absent').length;
  const late = sampleAttendanceData.filter(record => record.status.toLowerCase() === 'late').length;
  
  return {
    totalRecords,
    present,
    absent,
    late,
    attendanceRate: (present / totalRecords) * 100
  };
}