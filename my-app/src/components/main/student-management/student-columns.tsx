// components/main/student-management/student-columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar } from "../data-table/Avatar"
import { Student } from "@/app/interface/testapi"

export const createStudentColumns = (): ColumnDef<Student, unknown>[] => {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const student = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar src={student.picture} name={student.name} size="md" />
            <Link
              href={`/dashboard/attendance/${student.classId}/${student.id}`}
              className="font-medium hover:underline"
            >
              {student.name}
            </Link>
          </div>
        )
      },
    },
    {
      accessorKey: "class",
      header: "Class",
      cell: ({ row }) => <div>{row.original.class.name}</div>,
    },
    {
      id: "studentInfo",
      header: "Student Information",
      cell: ({ row }) => {
        const { email, phone } = row.original.parent ?? {}
        return (
          <div className="space-y-1">
            <div className="text-sm">{phone}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
          </div>
        )
      },
    },
    {
      id: "parentInfo",
      header: "Parent Information",
      cell: ({ row }) => {
        const { email, phone } = row.original.parent ?? {}
        return (
          <div className="space-y-1">
            <div className="text-sm">{phone}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "",
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
