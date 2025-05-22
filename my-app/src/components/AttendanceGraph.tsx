import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClasses } from '@/lib/actions/class.actions';
import { getClassWiseAttendance } from '@/lib/actions/attendance.actions';
import { Line } from '@ant-design/charts';
import { format, parseISO } from 'date-fns';

const AttendanceGraph: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRangeType>({ start: '01/08/23', end: '01/09/23' });

  useEffect(() => {
    const fetchClasses = async (): Promise<void> => {
      try {
        const getClass = await getClasses();
        
        if (!getClass) {
          console.error('Failed to fetch classes');
          return;
        }
        
        setClasses(getClass);
        if (getClass.length > 0) {
          setSelectedClass(getClass[0].id);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async (): Promise<void> => {
      if (!selectedClass) return;
      
      setLoading(true);
      try {
        const data = await getClassWiseAttendance(selectedClass);
        
        if (data && data.attendanceRecords) {
          // Transform data for chart
          const transformedData = processAttendanceData(data.attendanceRecords);
          setAttendanceData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedClass]);

  const processAttendanceData = (records: AttendanceRecord[]): ChartDataItem[] => {
    // Group attendance by day and student
    const groupedByDay: Record<string, Record<string, number>> = {};
    
    records.forEach(record => {
      if (!record.checkInTime) return;
      
      const date = format(parseISO(record.checkInTime), 'EEEE'); // Get day name
      const studentName = record.studentName || `Student ${record.studentId}`;
      
      if (!groupedByDay[date]) {
        groupedByDay[date] = {};
      }
      
      if (!groupedByDay[date][studentName]) {
        groupedByDay[date][studentName] = 0;
      }
      
      groupedByDay[date][studentName] += 1;
    });
    
    // Convert to format needed by Line chart
    const chartData: ChartDataItem[] = [];
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    dayOrder.forEach(day => {
      if (groupedByDay[day]) {
        Object.entries(groupedByDay[day]).forEach(([student, count]) => {
          chartData.push({
            day,
            student,
            count,
          });
        });
      } else {
        // Add placeholder for days with no data
        chartData.push({
          day,
          student: 'No Data',
          count: 0,
        });
      }
    });
    
    return chartData;
  };

  const handleClassChange = (value: string): void => {
    setSelectedClass(value);
  };

  const config = {
    data: attendanceData,
    xField: 'day',
    yField: 'count',
    seriesField: 'student',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    yAxis: {
      title: {
        text: 'Student Attendance Count',
      },
    },
    xAxis: {
      title: {
        text: 'Day of Week',
      },
    },
    legend: {
      position: 'top',
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow mb-[1rem]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Classes</SelectLabel>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500">
          {dateRange.start} → {dateRange.end}
        </div>
      </div>
      
      <div className="h-[400px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading data...</p>
          </div>
        ) : attendanceData.length > 0 ? (
          <Line {...config} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No attendance data available for the selected class</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceGraph;