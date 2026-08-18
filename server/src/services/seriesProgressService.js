import { prisma } from '../config/prisma.js';
import { collectionModel } from '../models/collectionModel.js';
import { serializeSeries } from '../lib/formatSeries.js';

// Specs §49 : % de complétion = cartes possédées / cartes nécessaires pour
// compléter la série, par rapport au catalogue.
export const seriesProgressService = {
  async getProgressForUser(userId) {
    const [ownedBySeries, totalsBySeries] = await Promise.all([
      collectionModel.ownedCardCountsBySeries(userId),
      prisma.product.groupBy({
        by: ['seriesId'],
        where: { category: { slug: 'card' }, seriesId: { not: null } },
        _count: true,
      }),
    ]);

    const totalMap = new Map(totalsBySeries.map((row) => [row.seriesId, row._count]));
    const seriesIds = [...new Set([...ownedBySeries.keys(), ...totalMap.keys()])];
    if (seriesIds.length === 0) return [];

    const seriesRows = await prisma.series.findMany({ where: { id: { in: seriesIds } } });
    const seriesById = new Map(seriesRows.map((s) => [s.id, s]));

    return seriesIds
      .map((seriesId) => {
        const owned = ownedBySeries.get(seriesId) ?? 0;
        const total = totalMap.get(seriesId) ?? 0;
        const percent = total > 0 ? Math.round((owned / total) * 1000) / 10 : 0;
        return {
          series: serializeSeries(seriesById.get(seriesId)),
          owned,
          total,
          percent,
        };
      })
      .filter((row) => row.series)
      .sort((a, b) => b.percent - a.percent);
  },

  async getProgressForSeries(userId, seriesId) {
    const all = await seriesProgressService.getProgressForUser(userId);
    return all.find((row) => row.series.id === seriesId) ?? null;
  },
};
