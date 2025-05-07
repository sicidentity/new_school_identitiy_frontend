'use client';

import { useState, useMemo } from 'react';
import { Line } from '@ant-design/charts';
import { Select, Typography, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface AttendanceChartProps {
  classAttendance: Record<string, Array<{
    day: string;
    attendance: number;
  }>>;
}

export function AttendanceChart({ classAttendance }: AttendanceChartProps) {
  const [classSelected, setClassSelected] = useState('JSS 3B');
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);

  // Compute adjusted date range before filtering
  const chartData = useMemo(() => {
    const classData = classAttendance[classSelected] || [];
    const adjustedStart = dates[0].subtract(1, 'day');
    const adjustedEnd = dates[1].add(1, 'day');

    return classData.filter(item => {
      const itemDate = dayjs(item.day);
      return itemDate.isAfter(adjustedStart) && itemDate.isBefore(adjustedEnd);
    });
  }, [classSelected, dates, classAttendance]);

  const config = {
    data: chartData,
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
    },
    yAxis: {
      title: {
        text: 'Students',
      },
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
