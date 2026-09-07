import { api, toQuery } from './client.js';

export const catalogApi = {
  home: () => api.get('/api/catalog/home'),
  search: (params) => api.get(`/api/catalog/search${toQuery(params)}`),
  byIds: (ids) => (ids.length === 0 ? Promise.resolve({ items: [] }) : api.get(`/api/catalog/products-by-ids${toQuery({ ids: ids.join(',') })}`)),
  productDetail: (id) => api.get(`/api/catalog/products/${id}`),
  productDetailBySlug: (seriesCode, slug) => api.get(`/api/catalog/products-by-slug/${seriesCode}/${slug}`),
  series: () => api.get('/api/catalog/series'),
  categories: () => api.get('/api/catalog/categories'),
  languages: () => api.get('/api/catalog/languages'),
  gradingCompanies: () => api.get('/api/catalog/grading-companies'),
  rarities: () => api.get('/api/catalog/rarities'),
};
