'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/customer': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Customer', link: '/dashboard/customer' }
  ],
  '/dashboard/transaction': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Transaction', link: '/dashboard/transaction' }
  ],
  '/dashboard/promotion': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Transaction', link: '/dashboard/promotion' }
  ],
  '/dashboard/employee': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Employee', link: '/dashboard/employee' }
  ],
  '/dashboard/giftcard': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Giftcard', link: '/dashboard/giftcard' }
  ],
  // Add more custom mappings as needed
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}