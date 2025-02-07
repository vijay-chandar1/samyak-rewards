'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'DEBIT', label: 'Debit' },
  { value: 'OTHER', label: 'Other' }
];

export function useTransactionTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    searchParams.q
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault('')
  );

  const [transactionTypeFilter, setTransactionTypeFilter] = useQueryState(
    'transactionType',
    searchParams.transactionType.withOptions({ shallow: false }).withDefault('')
  );

  const [page, setPage] = useQueryState(
    'page',
    searchParams.page.withDefault(1)
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setTransactionTypeFilter(null);
    setPage(1);
  }, [setSearchQuery, setTransactionTypeFilter, setPage]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!transactionTypeFilter;
  }, [searchQuery, transactionTypeFilter]);

  return {
    searchQuery,
    setSearchQuery,
    transactionTypeFilter,
    setTransactionTypeFilter,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive
  };
}