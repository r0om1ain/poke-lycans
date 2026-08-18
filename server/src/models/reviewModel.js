import { prisma } from '../config/prisma.js';

export const reviewModel = {
  create(data) {
    return prisma.review.create({ data });
  },

  hasReviewed(orderId, authorId) {
    return prisma.review
      .findUnique({ where: { orderId_authorId: { orderId, authorId } } })
      .then(Boolean);
  },

  listForTarget(targetUserId, { page = 1, pageSize = 20 } = {}) {
    return prisma.review.findMany({
      where: { targetUserId },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },

  // Compteurs affichés sur le profil public (§22), calculés à la volée.
  async getStatsForUser(targetUserId) {
    const rows = await prisma.review.groupBy({
      by: ['rating'],
      where: { targetUserId },
      _count: true,
    });
    const stats = { positive: 0, neutral: 0, negative: 0 };
    for (const row of rows) {
      if (row.rating === 'POSITIVE') stats.positive = row._count;
      if (row.rating === 'NEUTRAL') stats.neutral = row._count;
      if (row.rating === 'NEGATIVE') stats.negative = row._count;
    }
    return stats;
  },
};
