'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Transaction } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type RewardInfo = {
  amount: number;
  type: 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'FLAT_DISCOUNT' | 'PERCENTAGE_CREDIT' | 'FIXED_CREDIT' | 'POINT_BASED' | 'CUSTOM' | 'NONE';
  description: string;
  expiresAt?: Date | null;
}

const rewardTypeMap: Record<string, { short: string; full: string; description: string }> = {
  PERCENTAGE_DISCOUNT: {
    short: 'PD',
    full: 'Percentage Discount',
    description: 'Discount applied as a percentage of total amount'
  },
  FIXED_DISCOUNT: {
    short: 'FD',
    full: 'Fixed Discount',
    description: 'Fixed amount discount applied'
  },
  FLAT_DISCOUNT: {
    short: 'FLD',
    full: 'Flat Discount',
    description: 'Flat rate discount for entire order'
  },
  PERCENTAGE_CREDIT: {
    short: 'PC',
    full: 'Percentage Credit',
    description: 'Credit earned as percentage of purchase'
  },
  FIXED_CREDIT: {
    short: 'FC',
    full: 'Fixed Credit',
    description: 'Fixed amount credit earned'
  },
  POINT_BASED: {
    short: 'PTS',
    full: 'Points Based',
    description: 'Reward points earned based on purchase'
  },
  CUSTOM: {
    short: 'CUST',
    full: 'Custom Reward',
    description: 'Special custom-defined reward'
  },
  NONE: {
    short: '-',
    full: 'No Reward',
    description: 'No reward applied'
  },
};

export const columns: ColumnDef<Transaction>[] = [
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
  {
    accessorKey: 'phone',
    header: 'PHONE'
  },
  {
    accessorKey: 'amount',
    header: 'TRANSACTION AMOUNT',
    cell: ({ row }) => {
      return `₹${row.original.amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  },
  {
    accessorKey: 'type',
    header: 'PAYMENT MODE',
    cell: ({ row }) => {
      const type = row.original.type;
      return <Badge variant="outline">{type}</Badge>;
    }
  },
  {
    accessorKey: 'reward',
    header: 'REWARD',
    cell: ({ row }) => {
      const reward = row.original.reward as RewardInfo | undefined;
      if (!reward || reward.type === 'NONE') return '-';

      const rewardMeta = rewardTypeMap[reward.type] || {
        short: '?',
        full: 'Unknown Reward',
        description: 'Unknown reward type'
      };

      const formatRewardValue = (type: string, amount: number) => {
        switch (type) {
          case 'PERCENTAGE_DISCOUNT':
          case 'PERCENTAGE_CREDIT':
            return `${amount}`;
          case 'FIXED_DISCOUNT':
          case 'FIXED_CREDIT':
          case 'FLAT_DISCOUNT':
            return `₹${amount}`;
          case 'POINT_BASED':
            return `${amount} pts`;
          case 'CUSTOM':
            return `${amount}`;
          default:
            return `${amount}`;
        }
      };

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="cursor-help">
                {`${formatRewardValue(reward.type, reward.amount)} (${rewardMeta.short})`}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-800 text-gray-100 border-gray-700">
              <div className="space-y-2 p-1">
                <p className="font-semibold text-base">{rewardMeta.full}</p>
                <p className="text-sm text-gray-300">{rewardMeta.description}</p>
                {reward.expiresAt && (
                  <p className="text-xs text-gray-400">
                    Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  },
  {
    accessorKey: 'category',
    header: 'CATEGORY'
  },
  {
    accessorKey: 'createdAt',
    header: 'CREATED AT'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];