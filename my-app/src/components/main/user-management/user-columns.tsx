import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiTrash2 } from "react-icons/fi";
import { Button } from '@/components/ui/button';
import { User, Role } from "../../../app/interface/testapi";
import { ColumnDef } from "@tanstack/react-table";
import { BsPencil } from "react-icons/bs";

export const createUserColumns = (): ColumnDef<User>[] => {

    
  const handleEditUser = (user: User) => {
    console.log('Edit user:', user)
    // Implementation for editing a user
  }
  
  const handleDeleteUser = (user: User) => {
    console.log('Delete user:', user)
    // Implementation for deleting a user
  }

  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original
        
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role || Role.SECURITY
        
        return (
          <div className="flex items-center">
            <span className={`
              px-2 py-1 rounded-full text-xs
              ${role === Role.ADMIN ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
            `}>
              {role}
            </span>
          </div>
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleEditUser(user)
              }}
            >
              <BsPencil className="h-4 w-4 text-gray-500" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteUser(user)
              }}
            >
              <FiTrash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )
      }
    }
  ]
}