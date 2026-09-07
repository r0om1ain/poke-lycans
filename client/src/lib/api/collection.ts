import { api } from './client';
import type { Annonce, CollectionCarte, CollectionItem, Estimation, ProgressionSerie, ValeurTotale } from '@/types';

export const collectionApi = {
  list: (idSerie?: number) =>
    api.get<{ cartes: CollectionCarte[]; items: CollectionItem[] }>(`/api/collection${idSerie ? `?idSerie=${idSerie}` : ''}`),
  addCarte: (data: Record<string, unknown>) => api.post<CollectionCarte>('/api/collection/cartes', data),
  addItem: (data: Record<string, unknown>) => api.post<CollectionItem>('/api/collection/items', data),
  updateCarte: (id: number, quantite: number) => api.patch<CollectionCarte>(`/api/collection/cartes/${id}`, { quantite }),
  removeCarte: (id: number) => api.del<null>(`/api/collection/cartes/${id}`),
  progress: () => api.get<ProgressionSerie[]>('/api/collection/progress'),
  totalValue: () => api.get<ValeurTotale>('/api/collection/value'),
  estimatedValue: (id: number) => api.get<Estimation | null>(`/api/collection/cartes/${id}/estimate`),
  sell: (id: number, data: { prix: number; quantite: number; description?: string }) =>
    api.post<Annonce>(`/api/collection/cartes/${id}/sell`, data),
};
