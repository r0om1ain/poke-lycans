import { prisma } from '../config/prisma.js';
import { buildExemplarWhere } from '../lib/characteristics.js';

const withRelations = { series: true, category: true };

export const productModel = {
  findById(id) {
    return prisma.product.findUnique({ where: { id }, include: withRelations });
  },

  incrementViewCount(id) {
    return prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => null);
  },

  // Recherche catalogue (specs §12-13) : catégorie, série, nom, + caractéristiques
  // facultatives qui filtrent sur les offres actives correspondantes.
  async search({ categoryId, seriesId, name, page = 1, pageSize = 24, ...characteristics } = {}) {
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (seriesId) where.seriesId = seriesId;
    if (name) where.name = { contains: name, mode: 'insensitive' };

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

    return { items, total, page, pageSize };
  },

  newest(limit = 8) {
    return prisma.product.findMany({ include: withRelations, orderBy: { createdAt: 'desc' }, take: limit });
  },

  mostViewed(limit = 8) {
    return prisma.product.findMany({
      include: withRelations,
      orderBy: { viewCount: 'desc' },
      take: limit,
    });
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
    return rows.map((r) => byId.get(r.productId)).filter(Boolean);
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
    return products;
  },
};
