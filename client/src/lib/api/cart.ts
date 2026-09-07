import { api } from './client';
import type { Panier } from '@/types';

export const cartApi = {
  get: () => api.get<Panier>('/api/cart'),
  add: (idAnnonce: number, quantite = 1) => api.post<Panier>('/api/cart/items', { idAnnonce, quantite }),
  updateQuantity: (id: number, quantite: number) => api.patch<Panier>(`/api/cart/items/${id}`, { quantite }),
  remove: (id: number) => api.del<Panier>(`/api/cart/items/${id}`),
};
