import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PiTrashThin } from "react-icons/pi";

const AttendanceTable: React.FC<AttendanceTableProps> = ({ students }) => {
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
          <TableRow key={student.id} className="border-b bg-[#fff]">
            <TableCell className="px-2 flex flex-row items-center">
              <div className="w-8 h-8 rounded-full bg-[#268094] text-white flex items-center justify-center mr-[4px]">
                {student.name && student.name.charAt(0)}
              </div>
              <span className="font-semibold">{renderCellContent(student.name)}</span>
              </TableCell>
            <TableCell className="px-2">{renderCellContent(student.id)}</TableCell>
            <TableCell className="px-2">{renderCellContent(student.qrcodes.id)}</TableCell>
            <TableCell className="px-2">
              <button className="text-gray-600 hover:underline">
                <PiTrashThin size={20} />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default AttendanceTable