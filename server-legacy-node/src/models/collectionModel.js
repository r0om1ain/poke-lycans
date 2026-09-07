import { prisma } from '../config/prisma.js';

const fullInclude = {
  product: { include: { series: true, category: true } },
  language: true,
  gradingCompany: true,
};

export const collectionModel = {
  listByUser(userId, { seriesId } = {}) {
    return prisma.collectionItem.findMany({
      where: { userId, ...(seriesId ? { product: { seriesId } } : {}) },
      include: fullInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id) {
    return prisma.collectionItem.findUnique({ where: { id }, include: fullInclude });
  },

  create(data) {
    return prisma.collectionItem.create({ data, include: fullInclude });
  },

  update(id, data) {
    return prisma.collectionItem.update({ where: { id }, data, include: fullInclude });
  },

  remove(id) {
    return prisma.collectionItem.delete({ where: { id } });
  },

  // Nombre de cartes distinctes possédées par série, pour la progression (§49)
  async ownedCardCountsBySeries(userId) {
    const items = await prisma.collectionItem.findMany({
      where: { userId, product: { category: { slug: 'card' } } },
      select: { productId: true, product: { select: { seriesId: true } } },
    });
    const bySeriesSet = new Map();
    for (const item of items) {
      const seriesId = item.product.seriesId;
      if (!seriesId) continue;
      if (!bySeriesSet.has(seriesId)) bySeriesSet.set(seriesId, new Set());
      bySeriesSet.get(seriesId).add(item.productId);
    }
    const result = new Map();
    for (const [seriesId, set] of bySeriesSet) result.set(seriesId, set.size);
    return result;
  },
};
