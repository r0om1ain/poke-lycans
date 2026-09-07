import { api, toQuery } from './client';
import type { Commande, EnchereDetail, EnchereResume } from '@/types';

export const auctionsApi = {
  list: (params: { idSerie?: number; page?: number; pageSize?: number } = {}) =>
    api.get<EnchereResume[]>(`/api/auctions${toQuery(params)}`),
  detail: (id: number) => api.get<EnchereDetail>(`/api/auctions/${id}`),
  create: (formData: FormData) => api.post<EnchereDetail>('/api/auctions', formData, { isFormData: true }),
  placeBid: (id: number, montant: number) => api.post<EnchereDetail>(`/api/auctions/${id}/bids`, { montant }),
  // Plus de choix de mode de livraison (ShippingMethod supprimé) : la finalisation
  // ne demande plus qu'une adresse texte, la livraison est saisie par le vendeur ensuite.
  finalizePurchase: (id: number, data: { adresse: string; codePostal: string; ville: string; pays: string }) =>
    api.post<Commande>(`/api/auctions/${id}/finalize`, data),
  mine: () => api.get<EnchereResume[]>('/api/auctions/mine/all'),
};
