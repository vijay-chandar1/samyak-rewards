'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Customer } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { RewardsViewerCell } from './rewards-view';

export const columns: ColumnDef<Customer>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  // {
  //   accessorKey: 'name',
  //   header: 'NAME'
  // },
  {
    accessorKey: 'phone',
    header: 'PHONE NUMBER'
  },
  // {
  //   accessorKey: 'email',
  //   header: 'EMAIL'
  // },
  {
    accessorKey: 'rewards',
    header: 'REWARDS',
    cell: ({ row }) => {
      const rewards = row.original.rewards as Record<string, any[]>;
      return rewards ? (
        <RewardsViewerCell data={rewards} />
      ) : (
        '-'
      );
    }
  },
  {
    accessorKey: 'gender',
    header: 'GENDER'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];