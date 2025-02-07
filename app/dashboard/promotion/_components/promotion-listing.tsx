import { Promotion } from '@/constants/data';
import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as PromotionTable } from '@/components/ui/table/data-table';
import { columns } from './promotion-tables/columns';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { format } from 'date-fns';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import PromotionTableAction from './promotion-tables/promotion-table-action';

export default async function PromotionListingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Not authorized</div>;
  }

  const page = Number(searchParamsCache.get('page') ?? 1);
  const search = searchParamsCache.get('q');
  const pageLimit = Number(searchParamsCache.get('limit') ?? 10);
  const categories = searchParamsCache.get('categories');

  const whereClause: any = {
    userId: session.user.id,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(categories && { category: { in: categories.split('.') } })
  };

  const [promotions, totalPromotions, totalActivePromotions] = await Promise.all([
    prisma.promotion.findMany({
      where: whereClause,
      take: pageLimit,
      skip: (page - 1) * pageLimit,
      orderBy: { createdAt: 'desc' },
      include: {
        defaultRule: true // Include the defaultRule relation
      }
    }),
    prisma.promotion.count({ where: whereClause }),
    prisma.promotion.count({
      where: {
        userId: session.user.id,
        isActive: true
      }
    })
  ]);

  const transformedPromotions: Promotion[] = promotions.map((promotion) => ({
    ...promotion,
    startDate: format(new Date(promotion.startDate), 'PPp'),
    endDate: format(new Date(promotion.endDate), 'PPp'),
    createdAt: format(new Date(promotion.createdAt), 'PPp'),
    updatedAt: format(new Date(promotion.updatedAt), 'PPp'),
    defaultRule: promotion.defaultRule 
      ? {
          ...promotion.defaultRule,
          createdAt: format(new Date(promotion.defaultRule.createdAt), 'PPp'),
          updatedAt: format(new Date(promotion.defaultRule.updatedAt), 'PPp')
        }
      : null
  }));

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title={`Promotions (${totalPromotions})`}
            description={`(${totalActivePromotions} active)`}
          />
          <Link
            href="/dashboard/promotion/new"
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className="mr-2 h-4 w-4" /> New
          </Link>
        </div>
        <Separator />
        <PromotionTableAction />
        <PromotionTable
          columns={columns}
          data={transformedPromotions}
          totalItems={totalPromotions}
        />
      </div>
    </PageContainer>
  );
}