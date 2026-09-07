import { api, toQuery } from './client';
import type { Annonce, FacetCategorie, ItemKind } from '@/types';

export const listingsApi = {
  forProduct: (kind: ItemKind, id: number, filters: Record<string, unknown> = {}) =>
    api.get<Annonce[]>(`/api/listings/product${toQuery({ ...filters, [kind === 'carte' ? 'idCarte' : 'idItem']: id })}`),
  mine: (params: { idTypeItem?: number; idSerie?: number } = {}) =>
    api.get<Annonce[]>(`/api/listings/mine${toQuery(params)}`),
  myFacets: () => api.get<FacetCategorie[]>('/api/listings/mine/facets'),
  create: (data: FormData) => api.post<Annonce>('/api/listings', data, { isFormData: true }),
  update: (id: number, data: { prix?: number; quantite?: number; description?: string; statut?: string }) =>
    api.patch<Annonce>(`/api/listings/${id}`, data),
  remove: (id: number) => api.del<null>(`/api/listings/${id}`),
};
