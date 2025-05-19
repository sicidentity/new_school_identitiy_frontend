'use client';

import useSWR from 'swr';
import { StatsTabs } from '@/components/main/dashboard/statistic-tabs';
import { AttendanceChart } from '@/components/main/dashboard/attendance-graph';
import { DataTable } from '@/components/main/data-table/data-table';
import { createAttendanceColumns } from '@/components/main/dashboard/attendance-columns';
import { DashboardData } from '@/app/interface/testapi';

// SWR Fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardPage() {
  const { data, error } = useSWR<DashboardData>('/api/dashboard', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000, // Auto-refresh every 30s
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading dashboard...</div>;

  // Transform Attendance[] to AttendanceRecord[]
  const transformedAttendances = data.recentAttendances.map(attendance => {
    return {
      id: attendance.id,
      name: attendance.student?.name || 'Unknown',
      class: attendance.class?.name || 'Unknown',
      avatar: attendance.student?.picture,
      checkIn: attendance.checkInTime ? new Date(attendance.checkInTime).toISOString() : null,
      checkOut: attendance.checkOutTime ? new Date(attendance.checkOutTime).toISOString() : null
    };
  });

  return (
    <div className="flex !max-w-full flex-col gap-6 !pr-2">
      <StatsTabs 
        totalStudents={data.totalStudents}
        totalClasses={data.totalClasses}
        attendanceToday={data.attendanceToday}
      />
      
      <AttendanceChart classAttendance={data.classAttendance} />
      <DataTable 
        columns={createAttendanceColumns()} 
        data={transformedAttendances}
        filterColumn="name"
        filterPlaceholder="Filter students..."
        title="Recent Attendance Records"
        showFilters={false}
      />
    </div>
  );
}
