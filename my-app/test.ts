'use client';

import React, { useState, useEffect } from 'react';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import {
  getClasses,
} from '@/lib/actions/class.actions';
import {
  getClassWiseAttendance,
  getWeeklyAttendanceReport,
  getMonthlyAttendanceReport
} from '@/lib/actions/attendance.actions';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval
} from 'date-fns';

type ViewType = 'weekly' | 'monthly';

interface ClassItem {
  id: string;
  name: string;
}

interface ChartDataItem {
  period: string;
  attendance: number;
  date: string;
}

const AttendanceGraph: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('weekly');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClasses();
        if (res?.length) {
          setClasses(res);
          setSelectedClass(res[0].id);
        } else {
          setError('No classes found.');
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes');
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedClass) return;

      setLoading(true);
      setError('');

      try {
        const classData = await getClassWiseAttendance(selectedClass);
        if (!classData?.attendanceRecords?.length) {
          setError('No attendance records found.');
          return;
        }

        const studentIds = Array.from(new Set(classData.attendanceRecords.map(r => r.studentId)));
        let transformedData: ChartDataItem[] = [];

        if (viewType === 'weekly') {
          const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

          const weeklyReports = await Promise.all(
            studentIds.map(async (sid) => {
              try {
                return await getWeeklyAttendanceReport(parseInt(selectedClass), weekStart, weekEnd);
              } catch (err) {
                console.warn(`Weekly fetch failed:`, err);
                return null;
              }
            })
          );

          const validReports = weeklyReports.filter(Boolean);
          if (!validReports.length) {
            setError('No weekly attendance data.');
          }
          transformedData = processWeeklyData(validReports, weekStart, weekEnd);

        } else {
          const monthStart = startOfMonth(selectedDate);
          const monthEnd = endOfMonth(selectedDate);

          const monthlyReports = await Promise.all(
            studentIds.map(async (sid) => {
              try {
                return await getMonthlyAttendanceReport(parseInt(sid), selectedDate.getMonth() + 1, selectedDate.getFullYear());
              } catch (err) {
                console.warn(`Monthly fetch failed:`, err);
                return null;
              }
            })
          );

          const validReports = monthlyReports.filter(Boolean);
          if (!validReports.length) {
            setError('No monthly attendance data.');
          }
          transformedData = processMonthlyData(validReports, monthStart, monthEnd);
        }

        setAttendanceData(transformedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Could not load attendance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedClass, selectedDate, viewType]);

  const processWeeklyData = (reports: any[], start: Date, end: Date): ChartDataItem[] => {
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const count = reports.reduce((sum, report) => {
        const match = report.dailyAttendance?.find((d: any) => d.date === dateKey);
        return sum + (match?.present ? 1 : 0);
      }, 0);

      return {
        period: format(day, 'EEEE'),
        attendance: count,
        date: format(day, 'MMM dd'),
      };
    });
  };

  const processMonthlyData = (reports: any[], start: Date, end: Date): ChartDataItem[] => {
    const chartData: ChartDataItem[] = [];
    let current = startOfWeek(start, { weekStartsOn: 1 });

    while (current <= end) {
      const weekStart = current;
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const boundedStart = weekStart > start ? weekStart : start;
      const boundedEnd = weekEnd < end ? weekEnd : end;

      const weekDays = eachDayOfInterval({ start: boundedStart, end: boundedEnd });

      const attendance = reports.reduce((total, report) => {
        return total + weekDays.reduce((sum, day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const match = report.dailyAttendance?.find((d: any) => d.date === dayKey);
          return sum + (match?.present ? 1 : 0);
        }, 0);
      }, 0);

      chartData.push({
        period: `Week ${chartData.length + 1}`,
        attendance,
        date: `${format(boundedStart, 'MMM dd')} - ${format(boundedEnd, 'MMM dd')}`,
      });

      current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000); // move to next week
    }

    return chartData;
  };

  const getDateRangeText = () => {
    if (viewType === 'weekly') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
    }
    return format(selectedDate, 'MMMM yyyy');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = attendanceData.find(d => d.period === label);
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-bold">{label}</p>
          <p className="text-xs text-gray-600">Date: {item?.date || 'N/A'}</p>
          <p className="text-sm">🎓 Attendance: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Classes</SelectLabel>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={viewType} onValueChange={(val: ViewType) => setViewType(val)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getDateRangeText()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && (setSelectedDate(date), setCalendarOpen(false))}
              />
            </PopoverContent>
          </Popover>
        </div>

        {selectedClass && (
          <div className="text-sm text-gray-600">
            Showing {viewType} attendance for selected class
          </div>
        )}
      </div>

      <div className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full mb-2"></div>
            <p className="text-gray-600 ml-4">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : attendanceData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                angle={viewType === 'weekly' ? -45 : 0}
                textAnchor={viewType === 'weekly' ? 'end' : 'middle'}
                height={viewType === 'weekly' ? 80 : 60}
              />
              <YAxis label={{ value: 'Total Attendance', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
};

export default AttendanceGraph;
