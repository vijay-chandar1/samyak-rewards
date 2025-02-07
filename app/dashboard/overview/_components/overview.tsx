import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import PageContainer from '@/components/layout/page-container';
import { RecentSales } from './recent-sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewCards } from './cards';
import { auth } from '@/auth';

export default async function OverViewPage() {
  const session = await auth();

  // Get the user's name from the session
  const userName = session?.user?.name || '';

  return (
    <PageContainer scrollable>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome {userName} 👋
          </h2>
          <div className="hidden items-center space-x-2 md:flex">
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="overview"
            className="space-y-4"
            data-tabs-content="overview"
          >
            <OverviewCards />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <BarGraph />
              </div>
              <Card className="col-span-4 md:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
              <div className="col-span-4">
                <AreaGraph />
              </div>
              <div className="col-span-4 md:col-span-3">
                <PieGraph />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}