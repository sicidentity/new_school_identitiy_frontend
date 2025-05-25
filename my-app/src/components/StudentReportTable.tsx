'use client';

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StudentReportTable = ({ attendance }) => {
  if (!attendance || attendance.length === 0) {
    return (
      <Table>
        <TableHeader className="bg-gray-600">
          <TableRow>
            <TableHead className="px-2 text-white">Date</TableHead>
            <TableHead className="px-2 text-white">Check In</TableHead>
            <TableHead className="px-2 text-white">Check Out</TableHead>
            <TableHead className="px-2 text-white">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">No attendance data available</TableCell>
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

  return (
    <Table className="rounded-lg">
      <TableHeader className="bg-gray-600">
        <TableRow>
          <TableHead className="px-2 text-white">Date</TableHead>
          <TableHead className="px-2 text-white">Check In</TableHead>
          <TableHead className="px-2 text-white">Check Out</TableHead>
          <TableHead className="px-2 text-white">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendance.map((attend) => (
          <TableRow key={attend.id} className="border-b bg-[#fff]">
            <TableCell className="px-2 flex flex-row items-center">
              <span className="font-semibold">{renderCellContent(attend.day)}/{renderCellContent(attend.year)}</span>
              </TableCell>
            <TableCell className="px-2">{renderCellContent(attend.checkInTime)}</TableCell>
            <TableCell className="px-2">{renderCellContent(attend.checkOutTime)}</TableCell>
            <TableCell className="px-2">
              {renderCellContent(attend.status)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default StudentReportTable