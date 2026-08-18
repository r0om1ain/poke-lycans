import { prisma } from '../config/prisma.js';
import { buildExemplarWhere } from '../lib/characteristics.js';

const fullInclude = {
  product: { include: { series: true, category: true } },
  seller: true,
  language: true,
  gradingCompany: true,
};

export const listingModel = {
  findById(id) {
    return prisma.listing.findUnique({ where: { id }, include: fullInclude });
  },

  create(data) {
    return prisma.listing.create({ data, include: fullInclude });
  },

  // Offres actives d'une fiche produit, avec filtres d'état/langue/caractéristiques (§18)
  findByProduct(productId, filters = {}) {
    const where = { productId, status: 'ACTIVE', ...buildExemplarWhere(filters) };
    return prisma.listing.findMany({ where, include: fullInclude, orderBy: { price: 'asc' } });
  },

  countActiveForProduct(productId) {
    return prisma.listing.count({ where: { productId, status: 'ACTIVE' } });
  },

  // Offres actives d'un vendeur, éventuellement filtrées par catégorie (§23-24)
  async findBySeller(sellerId, { categoryId, page = 1, pageSize = 24 } = {}) {
    const where = {
      sellerId,
      status: 'ACTIVE',
      ...(categoryId ? { product: { categoryId } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: fullInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.listing.count({ where }),
    ]);
    return { items, total, page, pageSize };
  },

  // Nombre d'offres actives par catégorie de produit pour un vendeur (§23)
  async countsByCategoryForSeller(sellerId) {
    const listings = await prisma.listing.findMany({
      where: { sellerId, status: 'ACTIVE' },
      select: { product: { select: { category: { select: { id: true, slug: true, name: true } } } } },
    });
    const counts = {};
    for (const l of listings) {
      const { id, slug, name } = l.product.category;
      counts[slug] = counts[slug] ?? { id, name, count: 0 };
      counts[slug].count += 1;
    }
    return counts;
  },

  updateStatus(id, status) {
    return prisma.listing.update({ where: { id }, data: { status }, include: fullInclude });
  },

  decrementQuantity(id, quantity) {
    return prisma.listing.update({ where: { id }, data: { quantity: { decrement: quantity } } });
  },

  remove(id) {
    return prisma.listing.update({ where: { id }, data: { status: 'REMOVED' }, include: fullInclude });
  },
};
