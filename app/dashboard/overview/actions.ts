'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { startOfMonth, endOfMonth, subMonths, eachDayOfInterval, format } from 'date-fns';

export async function getBarChartData() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Not authorized');
    }

    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate }).map(
      (day) => format(day, 'yyyy-MM-dd')
    );

    const transactions = await prisma.transaction.groupBy({
      by: ['type', 'createdAt'],
      _sum: { amount: true },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        type: {
          in: ['CASH', 'UPI', 'CREDIT', 'DEBIT', 'OTHER']
        },
        userId: session.user.id
      }
    });

    return days.map((date) => {
      const dayTransactions = transactions.filter(
        (t) => format(new Date(t.createdAt), 'yyyy-MM-dd') === date
      );
      const cashTotal = dayTransactions
        .filter((t) => t.type === 'CASH')
        .reduce((sum, t) => sum + (t._sum.amount || 0), 0);
      const digitalTotal = dayTransactions
        .filter((t) => ['UPI', 'CREDIT', 'DEBIT', 'OTHER'].includes(t.type))
        .reduce((sum, t) => sum + (t._sum.amount || 0), 0);
      return { date, cash: cashTotal, digital: digitalTotal };
    });
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    throw new Error('Failed to fetch bar chart data');
  }
}

type ChartDataItem = {
  month: string;
  year: number;
  activePromotions: number;
  redemptions: number;
};

export async function getAreaChartData() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Not authorized');
    }

    const now = new Date();
    const startDate = startOfMonth(subMonths(now, 5));
    const endDate = endOfMonth(now);

    const monthlyPromotions = await prisma.promotion.groupBy({
      by: ['startDate', 'isActive', 'currentRedemptions'],
      where: {
        userId: session.user.id,
        startDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    const chartData: ChartDataItem[] = monthlyPromotions.reduce(
      (acc: ChartDataItem[], item) => {
        const date = new Date(item.startDate);
        const monthKey = format(date, 'MMMM');
        const yearKey = date.getFullYear();

        let existingMonth = acc.find(
          (m) => m.month === monthKey && m.year === yearKey
        );
        
        if (!existingMonth) {
          existingMonth = {
            month: monthKey,
            year: yearKey,
            activePromotions: 0,
            redemptions: 0
          };
          acc.push(existingMonth);
        }

        if (item.isActive) {
          existingMonth.activePromotions += 1;
        }
        existingMonth.redemptions += Number(item.currentRedemptions) || 0;
        
        return acc;
      },
      []
    );

    return chartData;
  } catch (error) {
    console.error('Error fetching promotion chart data:', error);
    throw new Error('Failed to fetch promotion chart data');
  }
}

export async function getPieChartData() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Not authorized');
    }

    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    const transactions = await prisma.transaction.groupBy({
      by: ['type'],
      _sum: { amount: true },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        type: {
          in: ['CASH', 'UPI', 'CREDIT', 'DEBIT', 'OTHER']
        },
        userId: session.user.id
      }
    });

    const chartData = [
      {
        type: 'CASH',
        amount: transactions.find((t) => t.type === 'CASH')?._sum.amount || 0,
        color: 'hsl(var(--chart-1))'
      },
      {
        type: 'UPI',
        amount: transactions.find((t) => t.type === 'UPI')?._sum.amount || 0,
        color: 'hsl(var(--chart-2))'
      },
      {
        type: 'CREDIT',
        amount: transactions.find((t) => t.type === 'CREDIT')?._sum.amount || 0,
        color: 'hsl(var(--chart-3))'
      },
      {
        type: 'DEBIT',
        amount: transactions.find((t) => t.type === 'DEBIT')?._sum.amount || 0,
        color: 'hsl(var(--chart-4))'
      },
      {
        type: 'OTHER',
        amount: transactions.find((t) => t.type === 'OTHER')?._sum.amount || 0,
        color: 'hsl(var(--chart-5))'
      }
    ].filter((item) => item.amount > 0);

    return chartData;
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    throw new Error('Failed to fetch pie chart data');
  }
}