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

  // "Mes offres" (Stock/Offers) : offres actives d'un vendeur, filtrables
  // comme le catalogue (nom, catégorie, série, prix, caractéristiques) —
  // même logique que productModel.search mais directement sur Listing
  // puisque les champs d'exemplaire y vivent déjà.
  async findBySeller(
    sellerId,
    { categoryId, seriesId, name, rarity, minPrice, maxPrice, page = 1, pageSize = 50, ...characteristics } = {},
  ) {
    const where = {
      sellerId,
      status: 'ACTIVE',
      ...buildExemplarWhere(characteristics),
    };
    if (categoryId || seriesId || name || rarity) {
      where.product = {
        ...(categoryId ? { categoryId } : {}),
        ...(seriesId ? { seriesId } : {}),
        ...(rarity ? { rarity } : {}),
        ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
      };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = Number(minPrice);
      if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
    }

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

  // Nombre d'offres actives par catégorie de produit pour un vendeur (§23,
  // repris pour "Mes offres" façon Cardmarket Stock/Offers)
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

  // Nombre d'offres actives par série, pour la navigation de "Mes offres"
  // (façon Cardmarket : liste des extensions avec le nombre d'articles dans
  // chacune).
  async countsBySeriesForSeller(sellerId, { categoryId } = {}) {
    const listings = await prisma.listing.findMany({
      where: { sellerId, status: 'ACTIVE', ...(categoryId ? { product: { categoryId } } : {}) },
      select: { product: { select: { series: { select: { id: true, code: true, name: true } } } } },
    });
    const counts = new Map();
    for (const l of listings) {
      const series = l.product.series;
      if (!series) continue;
      const entry = counts.get(series.id) ?? { id: series.id, label: `${series.code} : ${series.name}`, count: 0 };
      entry.count += 1;
      counts.set(series.id, entry);
    }
    return [...counts.values()].sort((a, b) => a.label.localeCompare(b.label));
  },

  update(id, data) {
    return prisma.listing.update({ where: { id }, data, include: fullInclude });
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
