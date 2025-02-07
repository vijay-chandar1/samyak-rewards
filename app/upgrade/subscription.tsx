'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { Rocket, Zap, ShieldBan, Check, ArrowRight, SkipForward, Loader2, IndianRupee} from 'lucide-react';
import { createSubscription, confirmSubscription } from './actions';
import { SubscriptionStatus } from '@prisma/client';

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => Promise<void>;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

interface ClientSubscriptionProps {
  initialStatus: SubscriptionStatus;
}

const premiumFeatures = [
  {
    icon: Rocket,
    title: "Unlimited Growth",
    description: "Scale your business without restrictions.",
    details: [
      "Unlimited monthly transactions",
      "Advanced revenue tracking",
      "Predictive insights"
    ]
  },
  {
    icon: Zap,
    title: "Advanced Automation",
    description: "Streamline workflows with powerful tools.",
    details: [
      "Full API access",
      "Automated reporting",
      "Integrations"
    ]
  },
  {
    icon: ShieldBan,
    title: "Enhanced Security",
    description: "Protect your business with enterprise-grade features.",
    details: [
      "Advanced data protection",
      "Compliance monitoring"
    ]
  }
];

export default function OnboardingSubscription({ initialStatus }: ClientSubscriptionProps) {
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setScriptLoaded(true);
    }
  }, []);

  const handleSubscribe = async () => {
    if (!scriptLoaded) {
      toast.error('Payment system is still loading. Please try again in a moment.', {
        action: { label: 'Refresh', onClick: () => window.location.reload() }
      });
      return;
    }

    setLoading(true);
    try {
      const response = await createSubscription();
      const { subscription, trialEnabled, trialEndsAt } = response;
      
      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        subscription_id: subscription.id,
        name: 'Your Business Platform',
        description: trialEnabled ? 'Premium Plan (with trial)' : 'Premium Plan',
        handler: async (response: RazorpayResponse) => {
          try {
            const result = await confirmSubscription(
              response.razorpay_payment_id,
              response.razorpay_subscription_id
            );
            
            setSubscriptionStatus(result.status);
            if (result.trialEndsAt) {
              setTrialEndDate(new Date(result.trialEndsAt));
            }
            toast.success('Successfully upgraded to Premium!');
            router.push('/dashboard/overview');
          } catch (error) {
            console.error('Payment confirmation failed:', error);
            toast.error('Failed to confirm subscription');
          }
        },
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Subscription failed:', error);
      toast.error('Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setSkipLoading(true);
    router.push('/dashboard/overview');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          toast.error('Payment system unavailable - Please refresh to try again', {
            action: { label: 'Retry', onClick: () => window.location.reload() }
          });
          setScriptLoaded(false);
        }}
      />

      <div className="w-full max-w-5xl relative">
        <Card className="w-full shadow-xl border-none dark:bg-gray-900 dark:border dark:border-gray-800">
          <CardHeader className="text-center py-6">
            <Zap className="mx-auto h-12 w-12 text-yellow-500 dark:text-yellow-400 mb-2" />
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge variant="secondary" className="text-lg py-1.5 px-4 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <IndianRupee className="h-4 w-4 inline-block mr-1" />
                999/month
              </Badge>
              {subscriptionStatus === SubscriptionStatus.BASIC && (
                <Badge variant="secondary" className="py-1.5 px-4 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  7-Day Free Trial
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Unlock Your Business Potential
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {subscriptionStatus === SubscriptionStatus.TRIAL && trialEndDate ? (
                `Your trial ends on ${trialEndDate.toLocaleDateString()}`
              ) : 'Take your business to the next level with our premium features.'}
            </CardDescription>
          </CardHeader>
          
          {/* Rest of the component remains the same */}
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {premiumFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <feature.icon className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-105 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.details.map((detail, detailIndex) => (
                      <li 
                        key={detailIndex} 
                        className="flex items-center text-xs text-gray-700 dark:text-gray-400"
                      >
                        <Check className="h-3 w-3 text-green-500 dark:text-green-400 mr-2" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center items-center space-x-3">
                <Button
                  onClick={handleSubscribe}
                  size="lg"
                  disabled={loading || subscriptionStatus !== SubscriptionStatus.BASIC}
                  className="px-6 text-sm dark:hover:bg-blue-800 text-white"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <span className="hidden sm:block">
                        {subscriptionStatus === SubscriptionStatus.TRIAL ? 'Continue Premium' : 'Upgrade to Premium'}
                      </span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSkip}
                  disabled={skipLoading}
                  className="px-6 text-sm dark:border-gray-600 dark:text-gray-300"
                >
                  {skipLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <>
                      <span className="hidden sm:block">Skip for Now</span>
                      <SkipForward className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {subscriptionStatus === SubscriptionStatus.BASIC 
                  ? 'No commitment. Cancel anytime. 7-day free trial included.'
                  : 'You have premium access'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}