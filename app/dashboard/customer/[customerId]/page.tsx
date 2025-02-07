import { NextPage } from 'next';
import { notFound } from 'next/navigation';
import { CustomerForm } from '../_components/customer-form';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { Customer } from '@/constants/data';

type CustomerViewPageProps = {
  params: {
    customerId: string;
  };
};

async function fetchCustomer(customerId: string): Promise<Customer | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
        userId: session.user.id
      },
      include: {
        transactions: true
      }
    });

    if (!customer) return null;

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      gender: customer.gender,
      taxNumber: customer.taxNumber,
      rewards: customer.rewards || {},
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      userId: customer.userId,
      transactions: customer.transactions.map(tx => ({
        id: tx.id,
        billerDetails: tx.billerDetails,
        discountPercentage: tx.discountPercentage,
        phone: tx.phone,
        amount: tx.amount,
        type: tx.type,
        reward: tx.reward,
        description: tx.description,
        category: tx.category,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
        customerId: tx.customerId,
        userId: tx.userId
      }))
    } as Customer;
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return null;
  }
}

export default async function CustomerViewPage({
  params
}: CustomerViewPageProps) {
  if (!params.customerId || params.customerId === 'new') {
    return <CustomerForm pageTitle="Create New Customer" />;
  }

  const customer = await fetchCustomer(params.customerId);
  if (!customer) {
    notFound();
  }

  return <CustomerForm initialData={customer} pageTitle="Edit Customer" />;
}

export const metadata = {
  title: 'Dashboard : Customer View'
};