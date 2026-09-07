// Vues récentes persistées côté serveur (datVueRecente) — remplace l'ancien
// stockage localStorage, cf. addendum du plan.
import { recentlyViewedApi } from '@/lib/api/account';
import type { ItemKind } from '@/types';

export function pushRecentlyViewed(kind: ItemKind, id: number): void {
  recentlyViewedApi.push(kind, id).catch(() => {
    // utilisateur non connecté ou API indisponible — pas bloquant.
  });
}
