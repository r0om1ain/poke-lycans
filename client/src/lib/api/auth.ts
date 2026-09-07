import { api } from './client';
import type { Personne } from '@/types';

export const authApi = {
  register: (data: { pseudo: string; email: string; motDePasse: string; nom: string; prenom: string }) =>
    api.post<Personne>('/api/auth/register', data),
  login: (data: { email: string; motDePasse: string }) => api.post<Personne>('/api/auth/login', data),
  logout: () => api.post<null>('/api/auth/logout'),
  me: () => api.get<Personne>('/api/auth/me'),
};
