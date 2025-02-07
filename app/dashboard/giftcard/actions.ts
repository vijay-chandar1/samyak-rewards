'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { randomBytes } from 'crypto';
import { GiftCard } from '@prisma/client';

export async function revalidateGiftCards() {
  revalidatePath('/dashboard/giftcard');
}

export async function createGiftCard(data: { 
  amount: number;
  description: string;
  validityDays: number;
  terms?: string;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const code = randomBytes(8).toString('hex').toUpperCase();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + data.validityDays);

    await prisma.giftCard.create({
      data: {
        code,
        amount: data.amount,
        description: data.description,
        terms: data.terms,
        validityDays: data.validityDays,
        expirationDate,
        userId
      }
    });

    revalidatePath('/dashboard/giftcard');
    return { success: true };
  } catch (error) {
    console.error('Gift card creation error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create gift card' };
  }
}

export async function updateGiftCard(id: string, data: {
  amount: number;
  description: string;
  validityDays: number;
  terms?: string;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + data.validityDays);

    await prisma.giftCard.update({
      where: { id, userId },
      data: {
        amount: data.amount,
        description: data.description,
        terms: data.terms,
        validityDays: data.validityDays,
        expirationDate
      }
    });

    revalidatePath('/dashboard/giftcard');
    return { success: true };
  } catch (error) {
    console.error('Gift card update error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update gift card' };
  }
}

export async function deleteGiftCard(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('Unauthorized');

    await prisma.giftCard.delete({
      where: { id, userId }
    });

    revalidatePath('/dashboard/giftcard');
    return { success: true };
  } catch (error) {
    console.error('Gift card deletion error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete gift card' };
  }
}

export async function fetchGiftCards() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const giftCards = await prisma.giftCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return { giftCards };
  } catch (error) {
    console.error('Fetching gift cards error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch gift cards' };
  }
}