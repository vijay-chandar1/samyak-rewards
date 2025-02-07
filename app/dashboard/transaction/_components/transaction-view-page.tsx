import TransactionForm from './transaction-form';
import PageContainer from '@/components/layout/page-container';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

interface TransactionViewPageProps {
  params: {
    transactionId: string;
  };
}

export default async function TransactionViewPage({ params }: TransactionViewPageProps) {
  let initialData = null;

  // Only fetch data if it's not a new transaction
  if (params.transactionId && params.transactionId !== 'new') {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: params.transactionId
      },
      include: {
        items: true
      }
    });

    if (!transaction) {
      notFound();
    }

    initialData = transaction;
  }

  return (
    <PageContainer>
      <TransactionForm initialData={initialData} />
    </PageContainer>
  );
}