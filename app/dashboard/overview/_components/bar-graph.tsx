'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent
} from '@/components/ui/chart';
import { getBarChartData } from '../actions';

interface BarChartData {
  date: string;
  cash: number;
  digital: number;
}

const chartConfig = {
  cash: {
    label: 'Cash',
    color: 'hsl(var(--chart-1))'
  },
  digital: {
    label: 'Digital',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const [chartData, setChartData] = React.useState<BarChartData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeChart, setActiveChart] = 
    React.useState<keyof typeof chartConfig>('cash');

  React.useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true);
        const data = await getBarChartData();
        setChartData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();
  }, []);

  const total = React.useMemo(() => {
    return chartData.reduce(
      (acc, curr) => {
        acc.cash += curr.cash || 0;
        acc.digital += curr.digital || 0;
        return acc;
      },
      { cash: 0, digital: 0 }
    );
  }, [chartData]);

  if (isLoading) {
    // ... loading state JSX remains the same ...
    return (
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <div className="animate-pulse">
              <div className="mb-2 h-6 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
          </div>
          <div className="flex">
            {(['cash', 'digital'] as const).map((key) => (
              <div
                key={key}
                className="relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              >
                <div className="animate-pulse">
                  <div className="mb-1 h-3 w-16 rounded bg-gray-200 dark:bg-gray-600"></div>
                  <div className="h-6 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="relative aspect-auto h-[280px] w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center text-red-500">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          No data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Monthly Sales Overview</CardTitle>
          <CardDescription>
            Total sales breakdown for the current month
          </CardDescription>
        </div>
        <div className="flex">
          {(['cash', 'digital'] as const).map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {total[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={chartConfig[activeChart].color} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}