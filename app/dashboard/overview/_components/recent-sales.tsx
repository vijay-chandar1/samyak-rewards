import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function RecentSales() {
  // Get the current session
  const session = await auth();

  // Ensure we have a logged-in user
  if (!session?.user?.id) {
    return <div>Not authorized</div>;
  }

  // Get the current month's start and end dates
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  // Count the number of transactions for the current month
  const salesCount = await prisma.transaction.count({
    where: {
      userId: session.user.id,
      type: {
        in: ['CASH', 'UPI', 'CREDIT', 'DEBIT', 'OTHER']
      },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Fetch recent transactions with customer details
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      type: {
        in: ['CASH', 'UPI', 'CREDIT', 'DEBIT', 'OTHER']
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    include: {
      customer: true
    }
  });

  // Calculate total sales amount
  const totalSales = recentTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        You made {salesCount} sales this month, totaling ₹
        {totalSales.toFixed(2)}
      </p>

      <div className="space-y-8">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {transaction.customer?.name
                  ? transaction.customer.name.substring(0, 2).toUpperCase()
                  : 'NA'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {transaction.customer?.name || 'Unknown Customer'}
              </p>
              <p className="text-sm text-muted-foreground">
                {transaction.phone || 'Unknown'}
              </p>
            </div>
            <div className="ml-auto space-x-2">
              <span className="text-xs text-muted-foreground">
                {transaction.type}
              </span>
              <span className="font-medium">
                +₹{transaction.amount.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}