import { checkStatus } from './actions';
import OnboardingSubscription from './subscription';
import PageContainer from '@/components/layout/page-container';

export default async function SubscriptionPage() {
  const initialStatus = await checkStatus();
  
  return (
    <PageContainer>
      <OnboardingSubscription initialStatus={initialStatus} />
    </PageContainer>
  );
}