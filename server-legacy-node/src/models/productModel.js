import { prisma } from '../config/prisma.js';
import { buildExemplarWhere } from '../lib/characteristics.js';
import { productSlug } from '../lib/slug.js';

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

  // URL lisible "/produits/:seriesCode/:slug" — pas de colonne de slug
  // stockée, on retrouve le produit en comparant le slug calculé de chaque
  // carte de la série (bornée, quelques centaines au plus).
  async findBySeriesCodeAndSlug(seriesCode, slug) {
    const series = await prisma.series.findUnique({ where: { code: seriesCode } });
    if (!series) return null;
    const products = await prisma.product.findMany({ where: { seriesId: series.id }, include: withRelations });
    return products.find((p) => productSlug(p) === slug) ?? null;
  },

  incrementViewCount(id) {
    return prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => null);
  },

  // "Réimpressions" : la même carte (même nom, même catégorie) imprimée dans
  // d'autres séries — permet de naviguer vers les autres éditions (§ nav).
  reprintsOf(product) {
    if (!product.categoryId) return [];
    return prisma.product.findMany({
      where: { name: product.name, categoryId: product.categoryId, id: { not: product.id } },
      include: { series: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
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
  async search({
    categoryId,
    seriesId,
    name,
    rarity,
    exact,
    availableOnly,
    minPrice,
    maxPrice,
    page = 1,
    pageSize = 24,
    ...characteristics
  } = {}) {
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (seriesId) where.seriesId = seriesId;
    if (rarity) where.rarity = rarity;
    if (name) {
      const isExact = exact === 'true' || exact === true;
      const nameMatch = isExact ? { equals: name, mode: 'insensitive' } : { contains: name, mode: 'insensitive' };

      // Permet aussi de chercher directement par numéro de carte ("35"), ou
      // par "code de série + numéro" ("EV10 045") — pas seulement par nom.
      const or = [{ name: nameMatch }, { cardNumber: { contains: name, mode: 'insensitive' } }];
      const parts = name.trim().split(/\s+/);
      if (parts.length === 2 && /\d/.test(parts[1])) {
        or.push({ series: { code: { contains: parts[0], mode: 'insensitive' } }, cardNumber: { contains: parts[1], mode: 'insensitive' } });
      }
      where.OR = or;
    }

    // Un seul filtre `listings.some` regroupant toutes les conditions liées
    // aux offres (disponibilité, prix, caractéristiques) — les écraser tour
    // à tour aurait perdu les précédentes.
    const listingWhere = {};
    const exemplarWhere = buildExemplarWhere(characteristics);
    Object.assign(listingWhere, exemplarWhere);
    if (minPrice !== undefined || maxPrice !== undefined) {
      listingWhere.price = {};
      if (minPrice !== undefined) listingWhere.price.gte = Number(minPrice);
      if (maxPrice !== undefined) listingWhere.price.lte = Number(maxPrice);
    }
    if (
      availableOnly === 'true' ||
      availableOnly === true ||
      Object.keys(listingWhere).length > 0
    ) {
      where.listings = { some: { status: 'ACTIVE', ...listingWhere } };
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

  // Valeurs de rareté réellement présentes en base (alimentées par le seed
  // TCGdex) — sert de liste pour le filtre "Rareté", pas de valeurs figées.
  async distinctRarities() {
    const rows = await prisma.product.findMany({
      where: { rarity: { not: null } },
      distinct: ['rarity'],
      select: { rarity: true },
      orderBy: { rarity: 'asc' },
    });
    return rows.map((r) => r.rarity).filter(Boolean).sort((a, b) => a.localeCompare(b));
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
