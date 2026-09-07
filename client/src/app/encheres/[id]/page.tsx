import { AuctionDetailClient } from '@/components/pages/AuctionDetailClient';

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuctionDetailClient id={Number(id)} />;
}
