'use client';
// src/app/dashboard/attendance/[classId]/[studentId]/columns.tsx
import { Button } from '@/components/ui/button';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

export const columns = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: { row: { getValue: (key: string) => string } }) => <div className="font-medium">{row.getValue('date')}</div>,
    },
    {
      accessorKey: 'checkIn',
      header: 'Check-in',
    },
    {
      accessorKey: 'checkOut',
      header: 'Check-out',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
        const status = row.getValue('status')
        const statusLower = status?.toLowerCase() || ''
        const colorClass = {
          present: 'text-green-600',
          absent: 'text-red-600',
          late: 'text-yellow-600'
        }[statusLower] || 'text-gray-600'
        
        return <div className={`font-semibold ${colorClass}`}>{status || 'Unknown'}</div>
      }
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { getValue: (key: string) => string; id: string } }) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              alert(`Edit entry: ${row.id}`);
            }}
            role="button"
            aria-label={`Edit attendance entry ${row.id}`}
          >
            <AiOutlineEdit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              alert(`Delete entry: ${row.id}`);
            }}
            role="button"
            aria-label={`Delete attendance entry ${row.id}`}
          >
            <AiOutlineDelete className="h-4 w-4" />
          </Button>
        </div>
      )
    }
    
  ]