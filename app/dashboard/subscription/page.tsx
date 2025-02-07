import { checkStatus } from './actions';
import ClientSubscription from './subscription';

export default async function SubscriptionPage() {
  // Fetch initial status on the server
  const initialStatus = await checkStatus();
  
  return (
    <ClientSubscription initialStatus={initialStatus} />
  );
}