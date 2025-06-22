'use client';

import useSWR from 'swr';
import { StatsTabs } from '@/components/main/dashboard/statistic-tabs';
import { AttendanceChart } from '@/components/main/dashboard/attendance-graph';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { DataTable } from '@/components/main/data-table/data-table';
import { createAttendanceColumns } from '@/components/main/dashboard/attendance-columns';
import { useState } from 'react';
import { DashboardData } from '../interface/testapi';

// SWR Fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardPage() {
  const { data, error } = useSWR<DashboardData>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard`, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000,
  });

  const [classSelected, setClassSelected] = useState<string>('JSS 3B');
  const [dates, setDates] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading dashboard...</div>;

  // Filter and sort attendances by class and date range
  const filteredAttendances = data.recentAttendances
    .filter(attendance => {
      const className = attendance.class?.name || 'Unknown';
      if (className !== classSelected) return false;
      const checkInDate = attendance.checkInTime ? dayjs(attendance.checkInTime) : null;
      if (!checkInDate) return false;
      return checkInDate.isSameOrAfter(dates[0], 'day') && checkInDate.isSameOrBefore(dates[1], 'day');
    })
    .sort((a, b) => {
      const aDate = a.checkInTime ? dayjs(a.checkInTime) : dayjs(0);
      const bDate = b.checkInTime ? dayjs(b.checkInTime) : dayjs(0);
      return aDate.valueOf() - bDate.valueOf();
    });

  // Transform Attendance[] to AttendanceRecord[]
  const transformedAttendances = filteredAttendances.map(attendance => {
    return {
      id: attendance.id,
      name: attendance.student?.name || 'Unknown',
      class: attendance.class?.name || 'Unknown',
      avatar: attendance.student?.picture,
      checkIn: attendance.checkInTime ? new Date(attendance.checkInTime).toISOString() : null,
      checkOut: attendance.checkOutTime ? new Date(attendance.checkOutTime).toISOString() : null,
      date: attendance.checkInTime ? dayjs(attendance.checkInTime).format('YYYY-MM-DD') : '--',
    };
  });

  return (
    <div className="flex !max-w-full flex-col gap-6 !pr-2">
      <StatsTabs 
        totalStudents={data.totalStudents}
        totalClasses={data.totalClasses}
        attendanceToday={data.attendanceToday}
      />
      <AttendanceChart
        classAttendance={data.classAttendance}
        classSelected={classSelected}
        setClassSelected={setClassSelected}
        dates={dates}
        setDates={setDates}
      />
      <DataTable 
        columns={createAttendanceColumns()}
        data={transformedAttendances}
        filterColumn="name"
        filterPlaceholder="Filter students..."
        title="Attendance Records"
        showFilters={false}
      />
    </div>
  );
}
