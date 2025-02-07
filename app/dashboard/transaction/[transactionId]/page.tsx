import TransactionViewPage from '../_components/transaction-view-page';

export const metadata = {
  title: 'Dashboard : Transaction View'
};

export default function Page({ params }: { params: { transactionId: string } }) {
  return <TransactionViewPage params={params} />;
}