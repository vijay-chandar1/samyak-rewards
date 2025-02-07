'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

export const CATEGORY_OPTIONS = [
  { value: 'electronics-appliances', label: 'Electronics & Appliances' },
  { value: 'furniture-home', label: 'Furniture & Home' },
  { value: 'clothing-accessories', label: 'Clothing & Accessories' },
  { value: 'health-beauty', label: 'Health & Beauty' },
  { value: 'groceries-essentials', label: 'Groceries & Essentials' },
  { value: 'sports-outdoors', label: 'Sports & Outdoors' },
  { value: 'toys-kids', label: 'Toys & Kids' },
  { value: 'others', label: 'Others' }
];

export function usePromotionTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    searchParams.q
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault('')
  );

  const [categoriesFilter, setCategoriesFilter] = useQueryState(
    'categories',
    searchParams.categories.withOptions({ shallow: false }).withDefault('')
  );

  const [page, setPage] = useQueryState(
    'page',
    searchParams.page.withDefault(1)
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setCategoriesFilter(null);

    setPage(1);
  }, [setSearchQuery, setCategoriesFilter, setPage]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!categoriesFilter;
  }, [searchQuery, categoriesFilter]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
    categoriesFilter,
    setCategoriesFilter
  };
}
