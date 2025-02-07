import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import TransactionTable from './transaction-tables';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { format } from 'date-fns';
import RewardPolicySettings from './transaction-settings-form';
import { RewardPolicy, RewardPolicyType } from '@prisma/client';

// Update the type to make expiry optional
type RewardPolicyData = {
  id: string;
  type: RewardPolicyType;
  config: any;
  expiry?: number | null;
};

type TTransactionListingPage = {};

export default async function TransactionListingPage({}: TTransactionListingPage) {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('q');
  const transactionType = searchParamsCache.get('transactionType');
  const pageLimit = searchParamsCache.get('limit');

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    throw new Error('User is not authenticated or email is missing.');
  }

  // Build where clause based on filters
  const whereClause: any = {
    user: {
      email: session.user.email
    },
    ...(search && {
      OR: [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } } 
      ]
    }),
    ...(transactionType && {
      type: {
        in: transactionType.split('.')
      }
    })
  };

  // Fetch transactions with pagination and filtering
  const [transactions, totalTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      include: {
        customer: true
      },
      take: pageLimit,
      skip: (page - 1) * pageLimit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.transaction.count({ where: whereClause })
  ]);

  // Transform the transactions
  const transformedTransactions = transactions.map((transaction) => ({
    ...transaction,
    createdAt: format(transaction.createdAt, 'PPp'),
    updatedAt: format(transaction.updatedAt, 'PPp')
  }));

  // Fetch current reward policy
  const currentPolicy = await prisma.rewardPolicy.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      type: true,
      config: true,
      expiry: true,
    }
  }) as RewardPolicyData | null;
  
  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title={`Transactions (${totalTransactions})`}
            description="Manage Transactions"
          />
          <div className="flex gap-2">
            <RewardPolicySettings currentPolicy={currentPolicy} />
            <Link
              href="/dashboard/transaction/new"
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <Plus className="mr-2 h-4 w-4" /> New
            </Link>
          </div>
        </div>
        <Separator />
        <TransactionTable 
          data={transformedTransactions} 
          totalData={totalTransactions} 
        />
      </div>
    </PageContainer>
  );
}