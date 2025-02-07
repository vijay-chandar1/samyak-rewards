'use server';

import { razorpay } from '@/utils/razorpay';
import { prisma } from '@/lib/db';
import { SubscriptionStatus } from '@prisma/client';
import { RazorpaySubscriptionCreateParams, SubscriptionResponse } from '@/types/razorpay';
import { auth } from '@/auth';

export async function checkStatus(): Promise<SubscriptionStatus> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });
  
  return user?.subscription?.status || SubscriptionStatus.BASIC;
}

export async function createSubscription(): Promise<SubscriptionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) throw new Error('User not found');

    const isEligibleForTrial = !user.subscription?.isTrialUsed;
    const trialEndDate = isEligibleForTrial
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null;

    const subscriptionParams: RazorpaySubscriptionCreateParams = {
      plan_id: process.env.RAZORPAY_PLAN_ID!,
      customer_notify: 1,
      total_count: 12,
      quantity: 1,
      notes: { email: user.email, userId: user.id }
    };

    if (isEligibleForTrial && trialEndDate) {
      subscriptionParams.start_at = Math.floor(trialEndDate.getTime() / 1000);
    }

    const razorpaySubscription = await razorpay.subscriptions.create(subscriptionParams);

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { razorpayId: razorpaySubscription.id },
      create: {
        userId: user.id,
        razorpayId: razorpaySubscription.id,
        isTrialUsed: isEligibleForTrial ? false : true,
      },
    });

    return {
      subscription: razorpaySubscription,
      trialEnabled: isEligibleForTrial,
      trialEndsAt: trialEndDate,
    };
  } catch (error) {
    console.error('Subscription creation failed:', error);
    throw new Error('Failed to create subscription');
  }
}

export async function confirmSubscription(
  paymentId: string,
  subscriptionId: string
): Promise<{ status: SubscriptionStatus; trialEndsAt: Date | null }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user?.subscription?.razorpayId || user.subscription.razorpayId !== subscriptionId) {
      throw new Error('Invalid subscription');
    }

    const razorpaySubscription = await razorpay.subscriptions.fetch(subscriptionId);
    
    if (!['active', 'created', 'authenticated'].includes(razorpaySubscription.status)) {
      throw new Error('Invalid subscription status');
    }

    const isEligibleForTrial = !user.subscription.isTrialUsed;
    const trialEndDate = isEligibleForTrial
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null;

    const updatedSubscription = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: isEligibleForTrial ? SubscriptionStatus.TRIAL : SubscriptionStatus.PREMIUM,
        trialEndsAt: trialEndDate,
        isTrialUsed: isEligibleForTrial,
      },
    });

    return {
      status: updatedSubscription.status,
      trialEndsAt: updatedSubscription.trialEndsAt,
    };
  } catch (error) {
    console.error('Subscription confirmation failed:', error);
    throw new Error('Failed to confirm subscription');
  }
}

export async function cancelSubscription() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user?.subscription?.razorpayId) {
      throw new Error('No subscription found');
    }

    await razorpay.subscriptions.cancel(user.subscription.razorpayId);
    
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: SubscriptionStatus.BASIC,
        razorpayId: null,
        trialEndsAt: null,
      },
    });

    return { message: 'Subscription cancelled successfully' };
  } catch (error) {
    console.error('Subscription cancellation failed:', error);
    throw new Error('Failed to cancel subscription');
  }
}