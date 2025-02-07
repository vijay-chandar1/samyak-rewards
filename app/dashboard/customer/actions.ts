'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Gender } from '@prisma/client';

export async function createCustomer(data: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const customer = await prisma.customer.create({
      data: {
        phone: data.get('phone') as string,
        name: (data.get('name') as string) || null,
        email: (data.get('email') as string) || null,
        gender: (data.get('gender') as Gender) || 'NA',
        taxNumber: (data.get('taxNumber') as string) || null,
        rewards: {},
        isActive: true,
        userId: session.user.id
      }
    });

    revalidatePath('/dashboard/customer');
    return { success: true, data: customer };
  } catch (error) {
    console.error('Customer creation error:', error);
    return { success: false, error: 'Failed to create customer' };
  }
}

export async function updateCustomer(customerId: string, data: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const customer = await prisma.customer.update({
      where: {
        id: customerId,
        userId: session.user.id
      },
      data: {
        phone: data.get('phone') as string,
        name: (data.get('name') as string) || null,
        email: (data.get('email') as string) || null,
        gender: (data.get('gender') as Gender) || 'NA',
        taxNumber: (data.get('taxNumber') as string) || null
      }
    });

    revalidatePath('/dashboard/customer');
    return { success: true, data: customer };
  } catch (error) {
    console.error('Customer update error:', error);
    return { success: false, error: 'Failed to update customer' };
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    await prisma.customer.delete({
        where: {
          id: customerId,
          userId: session.user.id
        }
      });

    revalidatePath('/dashboard/customer');
    return { success: true };
  } catch (error) {
    console.error('Customer deletion error:', error);
    return { success: false, error: 'Failed to delete customer' };
  }
}