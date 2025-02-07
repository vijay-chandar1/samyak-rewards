'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { getPieChartData } from '../actions';

type TransactionData = {
  type: string;
  amount: number;
  color: string;
};

export function PieGraph() {
  const [chartData, setChartData] = React.useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const chartConfig: ChartConfig = {
    CASH: { label: 'Cash', color: 'hsl(var(--chart-1))' },
    UPI: { label: 'UPI', color: 'hsl(var(--chart-2))' },
    CREDIT: { label: 'Credit', color: 'hsl(var(--chart-3))' },
    DEBIT: { label: 'Debit', color: 'hsl(var(--chart-4))' },
    OTHER: { label: 'Other', color: 'hsl(var(--chart-5))' }
  };

  React.useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        const data = await getPieChartData();
        setChartData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const { totalAmount, largestTransactionType } = React.useMemo(() => {
    if (chartData.length === 0) {
      return {
        totalAmount: 0,
        largestTransactionType: { type: 'N/A', amount: 0, color: 'gray' }
      };
    }

    const total = chartData.reduce((acc, curr) => acc + curr.amount, 0);
    const largest = chartData.reduce((prev, current) =>
      prev.amount > current.amount ? prev : current
    );

    return { totalAmount: total, largestTransactionType: largest };
  }, [chartData]);

  const percentageOfTotal = (amount: number) =>
    totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : '0';

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <div className="flex flex-col items-center space-y-2 w-full">
            <div className="h-7 w-48 animate-pulse rounded-md bg-muted"></div>
            <div className="h-4 w-32 animate-pulse rounded-md bg-muted"></div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto aspect-square max-h-[360px] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-full animate-pulse bg-muted"></div>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="h-6 w-24 animate-pulse rounded-md bg-muted mb-2"></div>
                <div className="h-4 w-16 animate-pulse rounded-md bg-muted"></div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted"></div>
          <div className="h-4 w-48 animate-pulse rounded-md bg-muted"></div>
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-destructive">
            <span className="text-lg font-medium">Error loading chart data</span>
            <span className="text-sm text-muted-foreground">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Transaction Type Distribution</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[360px]"
          >
            <PieChart>
              <Pie
                data={[{ type: 'No Data', amount: 1, color: 'hsl(var(--muted))' }]}
                dataKey="amount"
                nameKey="type"
                innerRadius={60}
                strokeWidth={5}
              >
                <Cell fill="hsl(var(--muted))" />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="flex items-center gap-2 font-medium leading-none">
            <TrendingUp className="h-4 w-4" />
            No transaction data available
          </div>
          <div className="text-sm leading-none text-muted-foreground">
            Showing transaction distribution for current month
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Transaction Type Distribution</CardTitle>
        <CardDescription>
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[360px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="type"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalAmount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Amount
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="flex items-center gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4" />
          {largestTransactionType.type !== 'N/A'
            ? `${largestTransactionType.type} leads with ${percentageOfTotal(
                largestTransactionType.amount
              )}% of total transactions`
            : 'No transaction data available'}
        </div>
        <div className="text-sm leading-none text-muted-foreground">
          Showing transaction distribution for current month
        </div>
      </CardFooter>
    </Card>
  );
}