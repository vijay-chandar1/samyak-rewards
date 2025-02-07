import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Customer, Transaction } from '@/constants/data';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import CustomerTable from './customer-tables';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { format } from 'date-fns';

type TCustomerListingPage = {};

export default async function CustomerListingPage({}: TCustomerListingPage) {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Not authorized</div>;
  }

  const page = Number(searchParamsCache.get('page')) || 1;
  const search = searchParamsCache.get('q');
  const gender = searchParamsCache.get('gender');
  const pageLimit = Number(searchParamsCache.get('limit')) || 10;

  const whereClause: any = {
    userId: session.user.id,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(gender && { gender: { in: gender.split('.') as Customer['gender'][] } })
  };

  const [customers, totalCustomers] = await Promise.all([
    prisma.customer.findMany({
      where: whereClause,
      take: pageLimit,
      skip: (page - 1) * pageLimit,
      orderBy: { createdAt: 'desc' },
      include: {
        transactions: {
          include: {
            items: true
          }
        }
      }
    }),
    prisma.customer.count({ where: whereClause })
  ]);

  const transformedCustomers: Customer[] = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    gender: customer.gender,
    taxNumber: customer.taxNumber,
    rewards: customer.rewards,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    userId: customer.userId,
    transactions: customer.transactions.map(tx => ({
      id: tx.id,
      billerDetails: tx.billerDetails,
      discountPercentage: tx.discountPercentage,
      phone: tx.phone,
      amount: tx.amount,
      type: tx.type,
      reward: tx.reward,
      description: tx.description,
      category: tx.category,
      createdAt: format(tx.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      updatedAt: format(tx.updatedAt, 'yyyy-MM-dd HH:mm:ss'),
      customerId: tx.customerId,
      userId: tx.userId
    }))
  }));

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title={`Customers (${totalCustomers})`}
            description="Manage Customers"
          />
          <div className="flex gap-2">
            <Link
              href={'/dashboard/customer/new'}
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <Plus className="mr-2 h-4 w-4" /> New
            </Link>
          </div>
        </div>
        <Separator />
        <CustomerTable data={transformedCustomers} totalData={totalCustomers} />
      </div>
    </PageContainer>
  );
}