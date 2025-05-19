'use client';

import * as React from 'react';
import Link from 'next/link';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Row, Cell } from '@tanstack/react-table';

import { DashboardStudent } from '@/types'; // Import the DashboardStudent type

type StudentRowProps = {
    row: Row<DashboardStudent>; // row is a Row of DashboardStudent type
    classId: string;
  };
  

export function StudentRow({ row, classId }: StudentRowProps) {
  const student= row.original;

  return (
    <TableRow data-state={row.getIsSelected() ? "selected" : undefined}>
      {row.getVisibleCells().map((cell: Cell<DashboardStudent, unknown>) => {
        if (cell.column.id === 'name') {
          return (
            <TableCell key={cell.id}>
              <Link 
                href={`/dashboard/attendance/${classId}/${student.id}`} 
                className="font-medium hover:underline"
              >
                {row.getValue('name')}
              </Link>
            </TableCell>
          );
        } 
        else if (cell.column.id === 'summary') {
          return (
            <TableCell key={cell.id}>
              <div className="flex items-center space-x-1">
                <span className="text-red-500 font-medium">{student.absences}</span>
                <span>/</span>
                <span className="text-green-500 font-medium">{student.attendance}</span>
                <span>/</span>
                <span className="text-yellow-500 font-medium">{student.late}</span>
              </div>
            </TableCell>
          );
        }
        else if (cell.column.id === 'actions') {
          return (
            <TableCell key={cell.id}>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <FaEdit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <FaTrash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </TableCell>
          );
        }
        else {
          return (
            <TableCell key={cell.id}>
              {cell.renderValue() as React.ReactNode}
            </TableCell>
          );
        }
      })}
    </TableRow>
  );
}
