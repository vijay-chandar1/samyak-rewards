import { Settings } from './settings';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return <div>Not authenticated</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      subscription: true,
      settings: true
    }
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">Settings</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start sm:items-end">
              <p className="font-medium text-sm sm:text-base">{user.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{user.email}</p>
              {user.subscription && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {user.subscription.status === 'TRIAL' ? 'Free Trial' : 'Pro Plan'}
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Icons.user className="w-5 h-5" />
            </div>
          </div>
        </div>

        <Card className="p-4 sm:p-6">
          <Settings 
            subscription={user.subscription} 
            initialSettings={user.settings || { theme: 'system' }}
          />
        </Card>
      </div>
    </PageContainer>
  );
}