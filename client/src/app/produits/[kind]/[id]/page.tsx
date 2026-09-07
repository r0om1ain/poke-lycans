import { ProductDetailClient } from '@/components/pages/ProductDetailClient';
import type { ItemKind } from '@/types';

export default async function ProductByIdPage({ params }: { params: Promise<{ kind: ItemKind; id: string }> }) {
  const { kind, id } = await params;
  return <ProductDetailClient kind={kind} id={Number(id)} />;
}
