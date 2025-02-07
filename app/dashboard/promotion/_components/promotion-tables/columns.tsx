'use client';
import { Promotion } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Promotion>[] = [
  {
    accessorKey: 'images',
    header: 'IMAGE',
    cell: ({ row }) => {
      const images = row.getValue('images');
      return (
        <div className="relative aspect-square">
          <Image
            src={
              (Array.isArray(images) ? images[0] : images) || '/placeholder.png'
            }
            alt={row.getValue('name')}
            fill
            unoptimized
            className="rounded-lg object-cover"
          />
        </div>
      );
    }
  },
  {
    accessorKey: 'name',
    header: 'NAME'
  },
  {
    accessorKey: 'category',
    header: 'CATEGORY'
  },
  {
    accessorKey: 'originalPrice',
    header: ' ORIGINAL PRICE'
  },
  {
    accessorKey: 'discountPercent',
    header: 'DISCOUNT'
  },
  {
    accessorKey: 'updatedPrice',
    header: 'OFFER PRICE'
  },
  {
    accessorKey: 'startDate',
    header: 'START DATE'
  },
  {
    accessorKey: 'endDate',
    header: 'END DATE'
  },
  {
    accessorKey: 'isActive',
    header: 'ACTIVE'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
