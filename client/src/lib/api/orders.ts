import { api, toQuery } from './client';
import type { Commande } from '@/types';

export const ordersApi = {
  // Plus d'addressId (pas de carnet d'adresses) : le checkout prend une adresse
  // texte à chaque fois, comme la finalisation d'enchère.
  checkout: (data: { adresse: string; codePostal: string; ville: string; pays: string }) =>
    api.post<Commande[]>('/api/orders/checkout', data),
  purchases: (status?: string) => api.get<Commande[]>(`/api/orders/purchases${toQuery({ status })}`),
  sales: (status?: string) => api.get<Commande[]>(`/api/orders/sales${toQuery({ status })}`),
  detail: (id: number) => api.get<Commande>(`/api/orders/${id}`),
  pay: (id: number) => api.post<Commande>(`/api/orders/${id}/pay`),
  ship: (id: number, data: { transporteur?: string; numeroSuivi?: string; modeLivraison?: string; frais?: number }) =>
    api.post<Commande>(`/api/orders/${id}/ship`, data),
  receive: (id: number) => api.post<Commande>(`/api/orders/${id}/receive`),
  // note : 1-5 (datEvaluation.EvaNote), remplace l'ancien Positive/Neutre/Négative.
  review: (id: number, data: { note: number; commentaire?: string }) => api.post<null>(`/api/orders/${id}/review`, data),
};
