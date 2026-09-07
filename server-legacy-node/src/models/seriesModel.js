import { prisma } from '../config/prisma.js';

export const seriesModel = {
  list() {
    return prisma.series.findMany({ orderBy: { code: 'desc' } });
  },
  findById(id) {
    return prisma.series.findUnique({ where: { id } });
  },
  findByCode(code) {
    return prisma.series.findUnique({ where: { code } });
  },
  upsert(code, name) {
    return prisma.series.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  },
};
