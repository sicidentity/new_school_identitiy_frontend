import { Table } from '@tanstack/react-table'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

interface DataTableHeaderProps<TData> {
  table: Table<TData>
  filterColumn?: string
  filterPlaceholder?: string
  title?: string
}

export function DataTableHeader<TData>({
  table,
  filterColumn,
  filterPlaceholder = "Filter...",
  title,
}: DataTableHeaderProps<TData>) {
  return (
    <div className="flex items-center justify-between py-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      
      <div className="flex items-center space-x-2 ml-auto">
        {filterColumn && (
          <Input
            placeholder={filterPlaceholder}
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}