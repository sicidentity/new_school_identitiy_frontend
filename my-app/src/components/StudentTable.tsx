import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Define proper types for Student data
interface Student {
  id: string;
  name: string;
  class?: string;
  checkIn?: string;
  checkOut?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  // Add any other potential properties
  [key: string]: any; // For any other properties
}

interface StudentTableProps {
  students: Student[];
}

const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  // Handle empty students array
  if (!students || students.length === 0) {
    return (
      <Table>
        <TableHeader className="bg-gray-600">
          <TableRow>
            <TableHead className="px-2 text-white">Student Name</TableHead>
            <TableHead className="px-2 text-white">Class</TableHead>
            <TableHead className="px-2 text-white">Check In</TableHead>
            <TableHead className="px-2 text-white">Check Out</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">No student data available</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  // Function to safely render cell content
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
    <Table>
      <TableHeader className="bg-gray-600">
        <TableRow>
          <TableHead className="px-2 text-white">Student Name</TableHead>
          <TableHead className="px-2 text-white">Class</TableHead>
          <TableHead className="px-2 text-white">Check In</TableHead>
          <TableHead className="px-2 text-white">Check Out</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id} className="border-b">
            <TableCell className="px-2">{renderCellContent(student.name)}</TableCell>
            <TableCell className="px-2">{renderCellContent(student.class)}</TableCell>
            <TableCell className="px-2">{renderCellContent(student.checkIn)}</TableCell>
            <TableCell className="px-2">{renderCellContent(student.checkOut)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default StudentTable