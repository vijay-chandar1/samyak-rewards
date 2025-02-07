import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export async function OverviewCards() {
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

  // Fetch total revenue for the current month
  const monthlyRevenue = await prisma.transaction.aggregate({
    where: {
      userId: session.user.id,
      type: {
        in: ['CASH', 'UPI', 'CREDIT', 'DEBIT', 'OTHER']
      },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    }
  });

  // Count total customers
  const totalCustomers = await prisma.customer.count({
    where: {
      userId: session.user.id,
    }
  });

  // Count this month's transactions
  const monthlyTransactions = await prisma.transaction.count({
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

  // Count active customers this month
  const activeCustomers = await prisma.customer.count({
    where: {
      userId: session.user.id,
      isActive: true,
      transactions: {
        some: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  });
  <svg
    fill="#000000"
    viewBox="-96 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M308 96c6.627 0 12-5.373 12-12V44c0-6.627-5.373-12-12-12H12C5.373 32 0 37.373 0 44v44.748c0 6.627 5.373 12 12 12h85.28c27.308 0 48.261 9.958 60.97 27.252H12c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h158.757c-6.217 36.086-32.961 58.632-74.757 58.632H12c-6.627 0-12 5.373-12 12v53.012c0 3.349 1.4 6.546 3.861 8.818l165.052 152.356a12.001 12.001 0 0 0 8.139 3.182h82.562c10.924 0 16.166-13.408 8.139-20.818L116.871 319.906c76.499-2.34 131.144-53.395 138.318-127.906H308c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12h-58.69c-3.486-11.541-8.28-22.246-14.252-32H308z"></path>
    </g>
  </svg>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{(monthlyRevenue._sum.amount || 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            This month&apos;s total revenue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">Customer Base Total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Transactions
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyTransactions}</div>
          <p className="text-xs text-muted-foreground">
            Transactions this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Customers
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCustomers}</div>
          <p className="text-xs text-muted-foreground">Active this month</p>
        </CardContent>
      </Card>
    </div>
  );
}