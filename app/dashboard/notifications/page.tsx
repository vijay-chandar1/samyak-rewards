import PageContainer from '@/components/layout/page-container';

export default function NotificationsPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold">Notifications</h3>
          <p className="text-muted-foreground">
            Manage your notification preferences
          </p>
        </div>
      </div>
    </PageContainer>
  );
}