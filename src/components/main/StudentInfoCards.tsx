'use client';

import * as React from 'react';
import { TransformedStudent } from '@/types'; // updated import
import { Avatar } from './data-table/Avatar'; // Ensure this path is correct

const StudentInfoCards = ({ student }: { student: TransformedStudent }) => (
  <div className='!p-1 bg-gray-400'>
    <div className="grid  grid-cols-4 gap-1 mb-8">
      {/* Avatar Card */}
      <div className="bg-white !p-6 !py-2 flex items-center flex-col shadow-sm border">
        <div className="mt-2 flex items-center">
          <Avatar src={student.avatar} name={student.name} size="lg" />
          <div className="text-xl font-semibold mt-2">{student.name}</div>
        </div>
      </div>

      {/* Admission Date  //adjust later */}
      <div className="bg-white !p-6 !py-2 flex items-center flex-col shadow-sm border">
        <div className="font-bold text-sm text-gray-500 mb-2">Admission Date</div>
        <div className="text-xl font-semibold mt-2">N/A</div>    
      </div>

      {/* Registration Card */}
      <div className="bg-white !p-6 !py-2 flex items-center flex-col shadow-sm border">
        <div className="font-bold text-sm text-gray-500 mb-2">Registration Number</div>
        <div className="text-xl font-semibold mt-2">{student.regNumber}</div>
      </div>

      {/* Class Card */}
      <div className="bg-white !p-6 !py-2 flex items-center flex-col shadow-sm border">
        <div className="font-bold text-sm text-gray-500 mb-2">Class</div>
        <div className="text-xl font-semibold mt-2">{student.class}</div>
      </div>
    </div>
  </div>
);

export default StudentInfoCards;
