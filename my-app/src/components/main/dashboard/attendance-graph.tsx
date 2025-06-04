'use client';

import { useMemo } from 'react';
import { Line } from '@ant-design/charts';
import { Select, Typography, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

import { Dispatch, SetStateAction } from 'react';
interface AttendanceChartProps {
  classAttendance: Record<string, Array<{
    day: string;
    attendance: number;
  }>>;
  classSelected: string;
  setClassSelected: Dispatch<SetStateAction<string>>;
  dates: [dayjs.Dayjs, dayjs.Dayjs];
  setDates: Dispatch<SetStateAction<[dayjs.Dayjs, dayjs.Dayjs]>>;
}

export function AttendanceChart({ classAttendance, classSelected, setClassSelected, dates, setDates }: AttendanceChartProps) {

  // Process chart data with proper date formatting and sorting
  const chartData = useMemo(() => {
    const classData = classAttendance[classSelected] || [];
    
    // Format and sort the data
    return classData
      .map(item => ({
        ...item,
        day: dayjs(item.day).format('YYYY-MM-DD') // Ensure consistent date format
      }))
      .sort((a, b) => dayjs(a.day).valueOf() - dayjs(b.day).valueOf());
  }, [classSelected, classAttendance]);
  
  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!dates[0] || !dates[1]) return chartData;
    
    const startDate = dates[0].startOf('day');
    const endDate = dates[1].endOf('day');
    
    return chartData.filter(item => {
      const itemDate = dayjs(item.day);
      return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
    });
  }, [chartData, dates]);

  const config = {
    data: filteredData,
    xField: 'day',
    yField: 'attendance',
    height: 300,
    color: '#22c55e',
    point: {
      size: 5,
      shape: 'circle',
    },
    areaStyle: {
      fill: 'l(270) 0:#ffffff 1:#22c55e',
    },
    xAxis: {
      title: {
        text: 'Day',
      },
      label: {
        formatter: (value: string) => dayjs(value).format('MMM D'),
      },
    },
    yAxis: {
      title: {
        text: 'Students',
      },
      min: 0,
      tickCount: 5,
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 2000,
      },
    },
  };

  const handleDateChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      setDates([dates[0], dates[1]]);
    }
  };

  return (
    <div className="!p-6 space-y-6 bg-white shadow rounded-lg">
      <div className="flex justify-between flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Title level={5} className="font-semibold mb-0">Class:</Title>
          <Select
            value={classSelected}
            onChange={setClassSelected}
            style={{ width: 180 }}
          >
            {Object.keys(classAttendance).map((className) => (
              <Option key={className} value={className}>
                {className}
              </Option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Title level={5} className="font-semibold mb-0">Date Range:</Title>
          <RangePicker
            value={dates}
            onChange={handleDateChange}
            format="MMM DD"
            className="w-[280px]"
          />
        </div>
      </div>

      <div className="!max-w-full">
        <Line {...config} />
      </div>
    </div>
  );
}
