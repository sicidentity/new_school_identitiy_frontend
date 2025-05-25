import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PiTrashThin } from "react-icons/pi";
import { getStudentStatistics } from '@/lib/actions/attendance.actions'
import { Button } from './ui/button';
import Link from 'next/link';

const AttendanceTable: React.FC<AttendanceTableProps> = ({ students }) => {
  const [studentStats, setStudentStats] = useState<Record<number, StudentStatistics>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchAllStatistics = async () => {
      if (!students || students.length === 0) return;

      const initialLoading = students.reduce((acc, student) => {
        acc[student.id] = true;
        return acc;
      }, {} as Record<number, boolean>);
      setLoading(initialLoading);

      const statsPromises = students.map(async (student) => {
        try {
          const stats = await getStudentStatistics(student.id);
          return { studentId: student.id, stats };
        } catch (error) {
          console.error(`Failed to fetch stats for student ${student.id}:`, error);
          return { studentId: student.id, stats: null };
        }
      });

      const results = await Promise.allSettled(statsPromises);
      const newStats: Record<number, StudentStatistics> = {};
      const newLoading: Record<number, boolean> = {};

      results.forEach((result, index) => {
        const studentId = students[index].id;
        newLoading[studentId] = false;

        if (result.status === 'fulfilled' && result.value.stats) {
          newStats[studentId] = result.value.stats;
        }
      });

      setStudentStats(newStats);
      setLoading(newLoading);
    };

    fetchAllStatistics();
  }, [students]);

  if (!students || students.length === 0) {
    return (
      <Table>
        <TableHeader className="bg-gray-600">
          <TableRow>
            <TableHead className="px-2 text-white">Name</TableHead>
            <TableHead className="px-2 text-white">Id</TableHead>
            <TableHead className="px-2 text-white">Summary</TableHead>
            <TableHead className="px-2 text-white">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">No students data available</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  const renderCellContent = (content: any): string => {
    if (content === null || content === undefined) {
      return 'N/A';
    }
    if (typeof content === 'object') {
      return JSON.stringify(content);
    }
    return String(content);
  };

  const renderSummary = (studentId: number) => {
    if (loading[studentId]) {
      return (
        <div className="text-sm text-gray-500">Loading...</div>
      );
    }

    const stats = studentStats[studentId];
    if (!stats) {
      return (
        <div className="text-sm text-red-500">Failed to load</div>
      );
    }

    return (
      <div className="text-sm">
        <div className="font-medium">
          Attendance: {stats.attendancePercentage.toFixed(1)}%
        </div>
        <div className="text-gray-600">
          Present: {stats.totalAttendance} | Absent: {stats.absences}
        </div>
      </div>
    );
  };

  return (
    <Table className="rounded-lg">
      <TableHeader className="bg-gray-600">
        <TableRow>
          <TableHead className="px-2 text-white">Name</TableHead>
          <TableHead className="px-2 text-white">Id</TableHead>
          <TableHead className="px-2 text-white">Summary</TableHead>
          <TableHead className="px-2 text-white">Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id} className="border-b bg-[#fff] hover:bg-gray-50 transition-colors">
            <TableCell className="px-2">
              <Link href={`/attendance/students/${student.id}`} className="flex flex-row items-center hover:opacity-80">
                <div className="w-8 h-8 rounded-full bg-[#268094] text-white flex items-center justify-center mr-[4px]">
                  {student.name && student.name.charAt(0)}
                </div>
                <span className="font-semibold">{renderCellContent(student.name)}</span>
              </Link>
            </TableCell>
            <TableCell className="px-2">
              <Link href={`/attendance/students/${student.id}`} className="hover:underline hover:text-blue-600">
                {renderCellContent(student.id)}
              </Link>
            </TableCell>
            <TableCell className="px-2">
              <Link href={`/attendance/students/${student.id}`} className="block hover:opacity-80">
                {renderSummary(student.id)}
              </Link>
            </TableCell>
            <TableCell className="px-2">
              <Button className="text-gray-600 hover:underline">
                <PiTrashThin size={20} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default AttendanceTable