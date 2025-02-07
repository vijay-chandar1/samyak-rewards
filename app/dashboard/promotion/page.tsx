import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/parsers';
import PromotionListingPage from './_components/promotion-listing';

export const metadata = {
  title: 'Dashboard: Promotions'
};

export default async function Page({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  return(
      <PromotionListingPage />
  );

}
