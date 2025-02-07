import GiftCardList from './giftcard-list';
import PageContainer from '@/components/layout/page-container';
import { fetchGiftCards } from './actions';

export const dynamic = 'force-dynamic';

export default async function GiftCardPage() {
  const { giftCards } = await fetchGiftCards();
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
        <GiftCardList initialGiftCards={giftCards || []} />
      </div>
    </PageContainer>
  );
}