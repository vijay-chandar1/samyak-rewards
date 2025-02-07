import { notFound } from 'next/navigation';
import PromotionForm from '../_components/promotion-form';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { Promotion } from '@/constants/data';

type PromotionViewPageProps = {
  params: {
    promotionId: string;
  };
};

async function fetchPromotion(promotionId: string): Promise<Promotion | null> {
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
        defaultRule: true
      }
    });

    if (!promotion) return null;

    return {
      ...promotion,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
      startDate: promotion.startDate.toISOString().split('T')[0],
      endDate: promotion.endDate.toISOString().split('T')[0],
      defaultRule: promotion.defaultRule 
        ? {
            ...promotion.defaultRule,
            createdAt: promotion.defaultRule.createdAt.toISOString(),
            updatedAt: promotion.defaultRule.updatedAt.toISOString()
          }
        : null
    } as Promotion;
  } catch (error) {
    console.error('Failed to fetch promotion:', error);
    return null;
  }
}

export default async function PromotionViewPage({
  params
}: PromotionViewPageProps) {
  if (!params.promotionId || params.promotionId === 'new') {
    return (
      <PromotionForm initialData={null} pageTitle="Create New Promotion" />
    );
  }

  const promotion = await fetchPromotion(params.promotionId);

  if (!promotion) {
    notFound();
  }

  return(
      <PromotionForm initialData={promotion} pageTitle="Edit Promotion" />
  );

}