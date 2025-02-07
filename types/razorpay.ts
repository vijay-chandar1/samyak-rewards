import { Subscriptions } from 'razorpay/dist/types/subscriptions';

// Use Razorpay's own type and extend it for our needs
export type RazorpaySubscription = Subscriptions.RazorpaySubscription;

export interface RazorpaySubscriptionCreateParams {
  plan_id: string;
  customer_notify: 1 | 0;
  total_count: number;
  quantity: number;
  start_at?: number;
  notes: {
    email: string;
    userId: string;
  };
}

export interface SubscriptionResponse {
  subscription: RazorpaySubscription;
  trialEnabled: boolean;
  trialEndsAt: Date | null;
}