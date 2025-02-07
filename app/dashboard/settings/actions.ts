'use server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import type { Prisma } from '@prisma/client';

type UserSettings = {
  theme?: 'light' | 'dark' | 'system';
  language?: 'en' | 'hi' | 'gu' | 'mr';
  tooltips?: boolean;
};

export async function updateUserSettings(email: string, settings: UserSettings) {
  const session = await auth();
  
  if (!session || session.user?.email !== email) {
    throw new Error('Unauthorized');
  }

  return prisma.user.update({
    where: { email },
    data: { 
      settings: settings as Prisma.InputJsonValue 
    }
  });
}