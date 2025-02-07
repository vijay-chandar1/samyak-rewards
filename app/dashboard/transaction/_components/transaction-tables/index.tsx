'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { Transaction } from '@/constants/data';
import { columns } from './columns';
import {
  TRANSACTION_TYPE_OPTIONS,
  useTransactionTableFilters
} from './use-transaction-table-filters';

export default function TransactionTable({
  data,
  totalData
}: {
  data: Transaction[];
  totalData: number;
}) {
  const {
    transactionTypeFilter,
    setTransactionTypeFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery
  } = useTransactionTableFilters();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="phone"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
        <DataTableFilterBox
          filterKey="transactionType"
          title="Transaction Type"
          options={TRANSACTION_TYPE_OPTIONS}
          setFilterValue={setTransactionTypeFilter}
          filterValue={transactionTypeFilter}
        />
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        />
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}