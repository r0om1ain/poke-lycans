import { prisma } from '../config/prisma.js';
import { buildExemplarWhere } from '../lib/characteristics.js';

const withRelations = { series: true, category: true };

// Attache `fromPrice` (prix minimum parmi les offres actives) à chaque
// produit — affiché "À partir de X €" sur les cartes produit, comme sur
// Cardmarket.
async function withMinPrice(products) {
  if (products.length === 0) return products;
  const rows = await prisma.listing.groupBy({
    by: ['productId'],
    where: { productId: { in: products.map((p) => p.id) }, status: 'ACTIVE' },
    _min: { price: true },
  });
  const minByProduct = new Map(rows.map((r) => [r.productId, r._min.price]));
  return products.map((p) => ({ ...p, fromPrice: minByProduct.get(p.id) ?? null }));
}

export const productModel = {
  findById(id) {
    return prisma.product.findUnique({ where: { id }, include: withRelations });
  },

  incrementViewCount(id) {
    return prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => null);
  },

  // Produits pour une liste d'ids donnée, en préservant l'ordre demandé —
  // utilisé pour "Vus récemment" (suivi côté client, localStorage).
  async byIds(ids) {
    if (!ids || ids.length === 0) return [];
    const products = await prisma.product.findMany({ where: { id: { in: ids } }, include: withRelations });
    const byId = new Map(products.map((p) => [p.id, p]));
    return withMinPrice(ids.map((id) => byId.get(id)).filter(Boolean));
  },

  // Recherche catalogue (specs §12-13) : catégorie, série, nom, + caractéristiques
  // facultatives qui filtrent sur les offres actives correspondantes.
  async search({ categoryId, seriesId, name, exact, availableOnly, page = 1, pageSize = 24, ...characteristics } = {}) {
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (seriesId) where.seriesId = seriesId;
    if (name) {
      where.name = exact === 'true' || exact === true ? { equals: name, mode: 'insensitive' } : { contains: name, mode: 'insensitive' };
    }
    if (availableOnly === 'true' || availableOnly === true) {
      where.listings = { some: { status: 'ACTIVE' } };
    }

    const exemplarWhere = buildExemplarWhere(characteristics);
    if (Object.keys(exemplarWhere).length > 0) {
      where.listings = { some: { status: 'ACTIVE', ...exemplarWhere } };
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: withRelations,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return { items: await withMinPrice(items), total, page, pageSize };
  },

  async newest(limit = 8) {
    const items = await prisma.product.findMany({ include: withRelations, orderBy: { createdAt: 'desc' }, take: limit });
    return withMinPrice(items);
  },

  async mostViewed(limit = 8) {
    const items = await prisma.product.findMany({
      include: withRelations,
      orderBy: { viewCount: 'desc' },
      take: limit,
    });
    return withMinPrice(items);
  },

  // "Best-sellers" (specs §11) : produits les plus présents dans des OrderItem.
  async bestSellers(limit = 8) {
    const rows = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
    if (rows.length === 0) return [];
    const products = await prisma.product.findMany({
      where: { id: { in: rows.map((r) => r.productId) } },
      include: withRelations,
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    return withMinPrice(rows.map((r) => byId.get(r.productId)).filter(Boolean));
  },

  // "Dernières mises en vente" (specs §11) : produits ayant reçu une offre récente.
  async recentlyListed(limit = 8) {
    const listings = await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: limit * 3,
      include: { product: { include: withRelations } },
    });
    const seen = new Set();
    const products = [];
    for (const listing of listings) {
      if (seen.has(listing.productId)) continue;
      seen.add(listing.productId);
      products.push(listing.product);
      if (products.length >= limit) break;
    }
    return withMinPrice(products);
  },
};
