'use client'

import { DataTable } from "@/components/main/data-table/data-table"
import { createUserColumns } from '@/components/main/user-management/user-columns'
import useSWR from 'swr'
import { User, UsersResponse } from '@/types'

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UserManagementPage() {
  // Fetch users from the API
  const { data, error, isLoading } = useSWR<UsersResponse>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`, fetcher);
  
  // Use the data from the API or fall back to an empty array
  const users = data?.data || [];

  const handleRowClick = (user: User) => {
    console.log('User clicked:', user)
    // Could open a modal with user details or navigate to user details page
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p>Loading users...</p>
      </div>
    );
  }

  // Handle error state
  if (error || !data?.success) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p>Error loading users: {data?.error || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          Add New User
        </Button>
      </div> */}
      
      <DataTable
        title="User List"
        columns={createUserColumns()}
        data={users}
        filterColumn="name"
        filterPlaceholder="Search users..."
        onRowClick={handleRowClick}
        showFilters={false}
      />
    </div>
  )
}