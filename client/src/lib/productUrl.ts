import type { ProduitResume } from '@/types';

// URL lisible "/produits/:kind/:seriesCode/:slug" (le second segment de route
// est bien nommé [id] côté dossier Next.js pour éviter un conflit de route
// dynamique, mais transporte le code série) ; repli sur "/produits/:kind/:id" sinon.
export function productUrl(item: ProduitResume): string {
  if (item.serie?.code && item.slug) {
    return `/produits/${item.type}/${item.serie.code}/${item.slug}`;
  }
  return `/produits/${item.type}/${item.id}`;
}
