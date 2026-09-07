import { api, toQuery } from './client';
import type { Bloc, CarteDetail, HomeData, ItemDetail, ItemKind, Langue, SearchResult, Serie, SocieteGradation, TypeItem } from '@/types';

export const catalogApi = {
  home: () => api.get<HomeData>('/api/catalog/home'),
  search: (params: Record<string, unknown>) => api.get<SearchResult>(`/api/catalog/search${toQuery(params)}`),

  carte: (id: number) => api.get<CarteDetail>(`/api/catalog/cartes/${id}`),
  carteBySlug: (serieCode: string, slug: string) => api.get<CarteDetail>(`/api/catalog/cartes/serie/${serieCode}/${slug}`),
  item: (id: number) => api.get<ItemDetail>(`/api/catalog/items/${id}`),
  itemBySlug: (serieCode: string, slug: string) => api.get<ItemDetail>(`/api/catalog/items/serie/${serieCode}/${slug}`),
  // Point d'entrée unique pratique côté front, route vers /cartes ou /items selon `kind`.
  produit: (kind: ItemKind, id: number) => (kind === 'carte' ? catalogApi.carte(id) : catalogApi.item(id)),
  produitBySlug: (kind: ItemKind, serieCode: string, slug: string) =>
    kind === 'carte' ? catalogApi.carteBySlug(serieCode, slug) : catalogApi.itemBySlug(serieCode, slug),

  series: () => api.get<Serie[]>('/api/catalog/series'),
  blocs: () => api.get<Bloc[]>('/api/catalog/blocs'),
  typesItem: () => api.get<TypeItem[]>('/api/catalog/types-item'),
  langues: () => api.get<Langue[]>('/api/catalog/langues'),
  societesGradation: () => api.get<SocieteGradation[]>('/api/catalog/societes-gradation'),
  raretes: () => api.get<string[]>('/api/catalog/raretes'),
};
