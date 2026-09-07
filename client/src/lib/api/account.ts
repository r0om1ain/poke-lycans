import { api } from './client';
import type { Personne, ProduitResume } from '@/types';

export const accountApi = {
  updateProfile: (data: Partial<Pick<Personne, 'nom' | 'prenom' | 'telephone' | 'adresse' | 'codePostal' | 'ville' | 'pays'>>) =>
    api.patch<Personne>('/api/account/profile', data),
};

// datVueRecente — persistance serveur des vues récentes (remplace le
// localStorage de l'ancien recentlyViewed.js).
export const recentlyViewedApi = {
  list: (limit = 12) => api.get<ProduitResume[]>(`/api/account/vues-recentes?limit=${limit}`),
  push: (kind: 'carte' | 'item', id: number) =>
    api.post<null>('/api/account/vues-recentes', kind === 'carte' ? { idCarte: id } : { idItem: id }),
};
