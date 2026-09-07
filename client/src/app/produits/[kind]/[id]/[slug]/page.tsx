import { ProductDetailClient } from '@/components/pages/ProductDetailClient';
import type { ItemKind } from '@/types';

// Le dossier s'appelle [id] (pas [seriesCode]) pour satisfaire la contrainte
// Next.js "un seul nom de segment dynamique par position" avec la route
// voisine /produits/[kind]/[id] — la valeur transportée est bien le code de série.
export default async function ProductBySlugPage({ params }: { params: Promise<{ kind: ItemKind; id: string; slug: string }> }) {
  const { kind, id, slug } = await params;
  return <ProductDetailClient kind={kind} seriesCode={id} slug={slug} />;
}
