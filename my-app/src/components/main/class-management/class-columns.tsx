import { ColumnDef } from '@tanstack/react-table';
import { Class } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmationModal } from '../../ui/confirmation-modal';

interface ClassActionsCellProps {
  classItem: Class;
}

const ClassActionsCell: React.FC<ClassActionsCellProps> = ({ classItem }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const openModal = (item: Class) => {
    setClassToDelete(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setClassToDelete(null);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;

    try {
      const response = await fetch(`/api/classes/${classToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error("Failed to delete class:", errorData.message || 'Unknown error');
        alert(`Error deleting class: ${errorData.message || 'Failed to delete'}`);
        closeModal();
        return;
      }

      console.log("Class deleted successfully:", classToDelete.id);
      // alert(`Class ${classToDelete.name || 'Item'} deleted successfully!`); // Optional: replace with toast notification
      router.refresh(); // Refresh data in the table
      closeModal();

    } catch (error) {
      console.error("Error during delete operation:", error);
      alert('An unexpected error occurred while deleting the class.');
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
          onClick={() => router.push(`/edit/classes/${classItem.id}`)}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => openModal(classItem)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
      {classToDelete && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={handleConfirmDelete}
          title={`Delete Class: ${classToDelete.name}`}
          message={`Are you sure you want to delete the class "${classToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="destructive"
        />
      )}
    </>
  );
};

export const createClassColumns = (onRowClick?: (row: Class) => void): ColumnDef<Class>[] => [
  {
    accessorKey: 'name',
    header: 'Class Name',
    cell: info => (
      <span
        style={{ cursor: onRowClick ? 'pointer' : 'default', color: onRowClick ? '#0070f3' : undefined }}
        onClick={() => onRowClick?.(info.row.original)}
      >
        {String(info.getValue())}
      </span>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: info => info.getValue() || '-',
  },
  {
    accessorKey: 'students',
    header: 'Students',
    cell: info => Array.isArray(info.row.original.students) ? info.row.original.students.length : 0,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: info => new Date(info.getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
    cell: info => new Date(info.getValue() as string).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const classItem = row.original;
      return <ClassActionsCell classItem={classItem} />;
    },
  },

];
