'use client';

import { useState, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export default function DatePicker({ selectedDate, onChange, placeholder = 'Select date' }: DatePickerProps) {
  const [viewDate, setViewDate] = useState(selectedDate ? dayjs(selectedDate) : dayjs());
  
  const daysInMonth = viewDate.daysInMonth();
  const firstDayOfMonth = viewDate.startOf('month').day();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  
  const handlePrevMonth = () => {
    setViewDate(viewDate.subtract(1, 'month'));
  };
  
  const handleNextMonth = () => {
    setViewDate(viewDate.add(1, 'month'));
  };
  
  const handleDateSelect = (day: number) => {
    const newDate = viewDate.date(day).toDate();
    onChange(newDate);
  };
  
  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center w-full px-3 py-2 text-left border rounded-md focus:outline-none">
        <div className="flex-1">
          {selectedDate ? dayjs(selectedDate).format('MMMM D, YYYY') : placeholder}
        </div>
        <Calendar className="w-5 h-5 ml-2 text-gray-400" />
      </Popover.Button>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute z-10 mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-4 w-64">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-medium">{viewDate.format('MMMM YYYY')}</div>
            <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="font-medium text-gray-500 py-1">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 mt-1">
            {emptyDays.map((day) => <div key={`empty-${day}`} className="h-8" />)}
            {days.map((day) => {
              const isSelected = selectedDate && 
                dayjs(selectedDate).date() === day && 
                dayjs(selectedDate).month() === viewDate.month() && 
                dayjs(selectedDate).year() === viewDate.year();
              
              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  className={`h-8 w-8 flex items-center justify-center rounded-full text-sm hover:bg-gray-100 focus:outline-none
                    ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}