import { api, toQuery } from './client';
import type { Annonce, Evaluation, SellerProfile } from '@/types';

// Plus de shippingMethods (ShippingMethod supprimé du schéma).
export const sellersApi = {
  profile: (id: number) => api.get<SellerProfile>(`/api/sellers/${id}`),
  listings: (id: number, params: { idTypeItem?: number } = {}) =>
    api.get<Annonce[]>(`/api/sellers/${id}/listings${toQuery(params)}`),
  reviews: (id: number) => api.get<Evaluation[]>(`/api/sellers/${id}/reviews`),
};
