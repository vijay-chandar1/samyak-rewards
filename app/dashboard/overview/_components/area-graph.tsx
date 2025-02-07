'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
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
  ChartTooltipContent
} from '@/components/ui/chart';
import { getAreaChartData } from '../actions';

type ChartData = {
  month: string;
  year: number;
  activePromotions: number;
  redemptions: number;
};

export function AreaGraph() {
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const chartConfig = {
    activePromotions: {
      label: 'Active Promotions',
      color: 'hsl(var(--chart-1))'
    },
    redemptions: {
      label: 'Promotion Redemptions',
      color: 'hsl(var(--chart-2))'
    }
  } satisfies ChartConfig;

  const { total, growthPercentage } = React.useMemo(() => {
    const totals = chartData.reduce(
      (acc, curr) => {
        acc.activePromotions += curr.activePromotions || 0;
        acc.redemptions += curr.redemptions || 0;
        return acc;
      },
      { activePromotions: 0, redemptions: 0 }
    );

    const growth =
      chartData.length > 1
        ? (chartData[chartData.length - 1].redemptions /
            chartData[chartData.length - 2].redemptions -
            1) *
            100 || 0
        : 0;

    return {
      total: totals,
      growthPercentage: growth
    };
  }, [chartData]);

  React.useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true);
        const data = await getAreaChartData();
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <div className="animate-pulse">
              <div className="mb-2 h-6 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="relative aspect-auto h-[280px] w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
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
        <CardContent className="flex h-[400px] items-center justify-center text-red-500">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Promotion Performance</CardTitle>
          <CardDescription>
            Showing active promotions and redemption trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[310px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={[{ month: '', activePromotions: 0, redemptions: 0 }]}
              margin={{
                left: 12,
                right: 12
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <Area
                dataKey="activePromotions"
                type="natural"
                fill="var(--color-activePromotions)"
                fillOpacity={0.4}
                stroke="var(--color-activePromotions)"
                stackId="a"
              />
              <Area
                dataKey="redemptions"
                type="natural"
                fill="var(--color-redemptions)"
                fillOpacity={0.4}
                stroke="var(--color-redemptions)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="flex items-center gap-2 font-medium leading-none">
            <TrendingUp className="h-4 w-4" />
            No data available
          </div>
          <div className="text-sm leading-none text-muted-foreground">
            Showing promotion performance trends
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promotion Performance</CardTitle>
        <CardDescription>
          Showing active promotions and redemption trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[310px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <Tooltip
              content={
                <ChartTooltipContent className="w-[200px]" indicator="dot" />
              }
            />
            <Area
              dataKey="activePromotions"
              type="natural"
              fill="var(--color-activePromotions)"
              fillOpacity={0.4}
              stroke="var(--color-activePromotions)"
              stackId="a"
            />
            <Area
              dataKey="redemptions"
              type="natural"
              fill="var(--color-redemptions)"
              fillOpacity={0.4}
              stroke="var(--color-redemptions)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="flex items-center gap-2 font-medium leading-none">
          <TrendingUp className={`h-4 w-4 ${growthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          Redemptions {growthPercentage >= 0 ? 'up' : 'down'} by {Math.abs(growthPercentage).toFixed(1)}% from previous month
        </div>
        <div className="text-sm leading-none text-muted-foreground">
          Showing data from {chartData[0]?.month} {chartData[0]?.year} to {chartData[chartData.length - 1]?.month} {chartData[chartData.length - 1]?.year}
        </div>
      </CardFooter>
    </Card>
  );
}