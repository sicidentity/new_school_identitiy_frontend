import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Trash2 } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { DashboardStudent } from "@/types";
import { Avatar } from "../data-table/Avatar";
import { useState } from 'react';
import { ConfirmationModal } from '../../ui/confirmation-modal';

interface StudentActionsCellProps {
  student: DashboardStudent;
}

const StudentActionsCell: React.FC<StudentActionsCellProps> = ({ student }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DashboardStudent | null>(null);

  const openModal = (item: DashboardStudent) => {
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
      // alert(`Student ${itemToDelete.name || 'Item'} deleted successfully!`); // Optional: replace with toast
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
          className="h-8 w-8"
          onClick={() => router.push(`/edit/student/${student.id}`)}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => openModal(student)} 
        >
          <Trash2 className="h-4 w-4" />
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
        const student = row.original;
        return <StudentActionsCell student={student} />;
      },
    },
  ]
}