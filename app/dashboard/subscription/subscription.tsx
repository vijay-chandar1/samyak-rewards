'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { checkStatus, createSubscription, confirmSubscription, cancelSubscription } from './actions';
import { SubscriptionStatus } from '@prisma/client';
import PageContainer from '@/components/layout/page-container';
import { toast } from "sonner";
import { Crown, User, Star, Gem, Check, Loader2 } from 'lucide-react';

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
    title: "Advanced Analytics & Reporting",
    description: "Get detailed insights with comprehensive analytics dashboard, custom reports, and trend analysis. Track your business growth with advanced metrics and visualizations."
  },
  {
    title: "Unlimited Transactions",
    description: "Process unlimited transactions per month with no restrictions on volume or value. Perfect for growing businesses with high transaction volumes."
  },
  {
    title: "API Access & Integrations",
    description: "Full API access for seamless integration with your existing tools and systems. Build custom workflows and automate your business processes."
  }
];

export default function SubscriptionPage({ initialStatus }: ClientSubscriptionProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (typeof window !== 'undefined' && window.Razorpay) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(checkSubscriptionStatus, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const status = await checkStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to check status:', error);
      toast.error('Failed to check subscription status');
    }
  };

  const getSubscriptionIcon = () => {
    switch (subscriptionStatus) {
      case SubscriptionStatus.PREMIUM:
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case SubscriptionStatus.TRIAL:
        return <Star className="h-8 w-8 text-purple-500" />;
      default:
        return <User className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleSubscribe = async () => {
    if (!scriptLoaded) {
      toast.error('Payment system is still loading. Please try again in a moment.', {
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
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
        name: 'Your Business Name',
        description: trialEnabled ? 'Premium Plan (with trial)' : 'Premium Plan',
        handler: async function(response: RazorpayResponse) {
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
          } catch (error) {
            console.error('Payment confirmation failed:', error);
            toast.error('Failed to confirm subscription');
            await checkSubscriptionStatus();
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

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelSubscription();
      setSubscriptionStatus(SubscriptionStatus.BASIC);
      setTrialEndDate(null);
      toast.success('Subscription cancelled successfully');
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  return (
    <PageContainer>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Razorpay script loaded');
          setScriptLoaded(true);
        }}
        onError={() => {
          console.error('Failed to load Razorpay script');
          toast.error('Payment system unavailable - Please refresh to try again', {
            action: {
              label: 'Retry',
              onClick: () => window.location.reload()
            }
          });
          setScriptLoaded(false);
        }}
      />
      
      <div className="min-h-screen w-full bg-background px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto w-full max-w-3xl space-y-8">
          <Card className="border shadow-sm">
            <CardHeader className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  Your Subscription
                </CardTitle>
                {subscriptionStatus === SubscriptionStatus.BASIC && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 w-fit text-sm px-3 py-1">
                    Upgrade Available
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col sm:flex-row items-start gap-6 p-6 bg-muted/50 rounded-xl">
                <div className="h-14 w-14 md:h-16 md:w-16 flex items-center justify-center bg-primary/10 rounded-full shrink-0">
                  {getSubscriptionIcon()}
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold flex items-center gap-3">
                      {subscriptionStatus === SubscriptionStatus.TRIAL ? 'Premium (Trial)' : subscriptionStatus}
                      {subscriptionStatus === SubscriptionStatus.PREMIUM && 
                        <Gem className="h-5 w-5 text-yellow-500" />
                      }
                    </h3>
                    
                    {subscriptionStatus === SubscriptionStatus.TRIAL && trialEndDate ? (
                      <p className="text-sm text-muted-foreground">
                        Trial ends on {trialEndDate.toLocaleDateString()}
                      </p>
                    ) : subscriptionStatus === SubscriptionStatus.PREMIUM ? (
                      <p className="text-sm text-muted-foreground">
                        You have access to all premium features
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Basic plan with limited features
                      </p>
                    )}
                  </div>

                  {subscriptionStatus === SubscriptionStatus.BASIC ? (
                    <Button
                      onClick={handleSubscribe}
                      variant="default"
                      size="lg"
                      disabled={loading || !scriptLoaded}
                      className="w-full sm:w-auto"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </div>
                      ) : !scriptLoaded ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading Payment...
                        </div>
                      ) : (
                        'Upgrade to Premium'
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowCancelDialog(true)}
                      variant="destructive"
                      size="lg"
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </div>
                      ) : 'Cancel Subscription'}
                    </Button>
                  )}
                </div>
              </div>

              {subscriptionStatus === SubscriptionStatus.BASIC && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">Premium Features Available on Upgrade</h4>
                  <Accordion type="single" collapsible className="w-full">
                    {premiumFeatures.map((feature, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          <span className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            {feature.title}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {feature.description}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="sm:max-w-[450px] p-6">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-xl">Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to cancel your subscription? You&apos;ll lose access to premium features at the end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel disabled={loading} className="w-full sm:w-auto text-base">
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : 'Yes, cancel subscription'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}