import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "../data-table/Avatar"
import { format } from "date-fns"

interface AttendanceRecord {
  id: string
  name: string
  class: string
  avatar?: string
  checkIn: string | null
  checkOut: string | null
}

export const createAttendanceColumns = (): ColumnDef<AttendanceRecord, unknown>[] => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Student
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const record = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar src={record.avatar} name={record.name} size="md" />
            <div>
              <div className="font-medium">{record.name}</div>
              <div className="text-sm text-muted-foreground">{record.class}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'class',
      header: 'Class',
      cell: ({ row }) => <div>{row.original.class}</div>,
    },
    {
      accessorKey: 'checkIn',
      header: 'Check In',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.checkIn 
            ? format(new Date(row.original.checkIn), 'hh:mm:ss a') 
            : '--'}
        </div>
      ),
    },
    {
      accessorKey: 'checkOut',
      header: 'Check Out',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.checkOut 
            ? format(new Date(row.original.checkOut), 'hh:mm:ss a') 
            : '--'}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
            !row.original.checkIn ? 'bg-gray-400' : 
            !row.original.checkOut ? 'bg-green-500' : 'bg-blue-500'
          }`} />
          <span>
            {!row.original.checkIn ? 'Absent' : 
             !row.original.checkOut ? 'Present' : 'Checked Out'}
          </span>
        </div>
      ),
    }
  ]
}