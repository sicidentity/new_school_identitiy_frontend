import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Trash2 } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { DashboardStudent } from "@/types"
import { Avatar } from "../data-table/Avatar"



// Function to create columns with the class ID for routing
export const createStudentColumns = (classId: string): ColumnDef<DashboardStudent>[] => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const student = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar 
              src={student.avatar} 
              name={student.name} 
              size="md" 
            />
            <Link 
              href={`/attendance/${classId}/${student.id}`}
              className="font-medium hover:underline"
            >
              {student.name}
            </Link>
          </div>
        )
      },
    },
    {
      accessorKey: 'regNumber',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Registration Number
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('regNumber')}</div>,
    },
    {
      id: 'summary',
      header: 'Summary',
      cell: ({ row }) => {
        const student = row.original
        return (
          <div className="flex items-center space-x-1">
            <span className="text-red-500 font-medium">{student.absences}</span>
            <span>/</span>
            <span className="text-green-500 font-medium">{student.attendance}</span>
            <span>/</span>
            <span className="text-yellow-500 font-medium">{student.late}</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const student = row.original
        return (
          <div className="flex justify-end space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => alert(`Edit student: ${student.id}`)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => alert(`Delete student: ${student.id}`)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )
      },
    },
  ]
}