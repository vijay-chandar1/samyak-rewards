import { notFound } from 'next/navigation';
import PromotionForm from './promotion-form';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { Promotion } from '@/constants/data';

type PromotionViewPageProps = {
  params?: {
    promotionId?: string;
  };
};

async function fetchPromotion(promotionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const promotion = await prisma.promotion.findUnique({
      where: {
        id: promotionId,
        userId: session.user.id
      },
      include: {
        defaultRule: true // Include the defaultRule relation
      }
    });

    return promotion;
  } catch (error) {
    console.error('Failed to fetch promotion:', error);
    return null;
  }
}

export default async function PromotionViewPage({
  params
}: PromotionViewPageProps) {
  let promotion: Promotion | null = null;
  let pageTitle = 'Create New Promotion';

  if (params?.promotionId && params.promotionId !== 'new') {
    const fetchedPromotion = await fetchPromotion(params.promotionId);

    if (!fetchedPromotion) {
      notFound();
    }

    promotion = {
      ...fetchedPromotion,
      createdAt: fetchedPromotion.createdAt.toISOString(),
      updatedAt: fetchedPromotion.updatedAt.toISOString(),
      startDate: fetchedPromotion.startDate.toISOString().split('T')[0],
      endDate: fetchedPromotion.endDate.toISOString().split('T')[0],
      defaultRule: fetchedPromotion.defaultRule 
        ? {
            ...fetchedPromotion.defaultRule,
            createdAt: fetchedPromotion.defaultRule.createdAt.toISOString(),
            updatedAt: fetchedPromotion.defaultRule.updatedAt.toISOString()
          }
        : null
    } as Promotion;

    pageTitle = 'Edit Promotion';
  }

  return (
      <PromotionForm initialData={promotion} pageTitle={pageTitle} />
  );
}