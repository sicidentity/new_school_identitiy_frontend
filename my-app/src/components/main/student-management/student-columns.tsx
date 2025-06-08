// components/main/student-management/student-columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar } from "../data-table/Avatar";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmationModal } from '../../ui/confirmation-modal';
import { Student } from "@/types"; // Assuming Student type is in @/types
import { toast } from 'sonner';

interface StudentManagementActionsCellProps {
  student: Student;
}

const StudentManagementActionsCell: React.FC<StudentManagementActionsCellProps> = ({ student }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Student | null>(null);

  const openModal = (item: Student) => {
    setItemToDelete(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setItemToDelete(null);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/students/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error("Failed to delete student:", errorData.message || 'Unknown error');
        alert(`Error deleting student: ${errorData.message || 'Failed to delete'}`);
        closeModal();
        return;
      }

      console.log("Student deleted successfully:", itemToDelete.id);
      toast.success(`Student ${itemToDelete.name || ''} deleted successfully!`);
      router.refresh();
      closeModal();

    } catch (error) {
      console.error("Error during delete operation:", error);
      alert('An unexpected error occurred while deleting the student.');
      closeModal();
    }
  };

  return (
    <>
      <div className="flex justify-end space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 group hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/edit/student/${student.id}`);
          }}
          role="button"
          aria-label="Edit student"
        >
          <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 group hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            openModal(student);
          }}
          role="button"
          aria-label="Delete student"
        >
          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform duration-200" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
      {itemToDelete && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={handleConfirmDelete}
          title={`Delete Student: ${itemToDelete.name}`}
          message={`Are you sure you want to delete the student "${itemToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="destructive"
        />
      )}
    </>
  );
};

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
              href={`/attendance/${student.classId}/${student.id}`}
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
        const student = row.original;
        return <StudentManagementActionsCell student={student} />;
      },
    },
  ]
}
