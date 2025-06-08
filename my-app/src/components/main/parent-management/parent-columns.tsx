import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "../data-table/Avatar";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmationModal } from '../../ui/confirmation-modal';
import { Parent } from "@/types/models";
import { toast } from 'sonner';

interface ParentActionsCellProps {
  parentItem: Parent;
}

const ParentActionsCell: React.FC<ParentActionsCellProps> = ({ parentItem }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Parent | null>(null);

  const openModal = (item: Parent) => {
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
      const response = await fetch(`/api/parents/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error("Failed to delete parent:", errorData.message || 'Unknown error');
        alert(`Error deleting parent: ${errorData.message || 'Failed to delete'}`);
        closeModal();
        return;
      }

      console.log("Parent deleted successfully:", itemToDelete.id);
      toast.success(`Parent ${itemToDelete.name || ''} deleted successfully!`);
      router.refresh();
      closeModal();

    } catch (error) {
      console.error("Error during delete operation:", error);
      alert('An unexpected error occurred while deleting the parent.');
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
            router.push(`/edit/parent/${parentItem.id}`);
          }}
          role="button"
          aria-label="Edit parent"
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
            openModal(parentItem);
          }}
          role="button"
          aria-label="Delete parent"
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
          title={`Delete Parent: ${itemToDelete.name}`}
          message={`Are you sure you want to delete the parent "${itemToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="destructive"
        />
      )}
    </>
  );
};

export const createParentColumns = (): ColumnDef<Parent, unknown>[] => [
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
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.original.picture} name={row.original.name} size="md" />
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span>{row.original.phone}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span>{row.original.email}</span>,
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => <span>{row.original.address}</span>, // row is used here, so this is not an error. If you see an error, ensure the variable is actually used.
  },
  // Add more columns as needed for students, notifications, etc.
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const parentItem = row.original;
      return <ParentActionsCell parentItem={parentItem} />;
    },
  },
];
