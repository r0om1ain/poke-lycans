import { prisma } from '../config/prisma.js';

// Listes de référence gérables (specs §12 : "autres langues disponibles",
// §8 : "autres sociétés de gradation présentes dans la liste de
// l'application") — administrables plus tard, simple lecture pour l'instant.

export const languageModel = {
  list() {
    return prisma.language.findMany({ orderBy: { name: 'asc' } });
  },
  upsert(code, name) {
    return prisma.language.upsert({ where: { code }, update: { name }, create: { code, name } });
  },
};

export const gradingCompanyModel = {
  list() {
    return prisma.gradingCompany.findMany({ orderBy: { name: 'asc' } });
  },
  upsert(name, logo) {
    return prisma.gradingCompany.upsert({ where: { name }, update: { logo }, create: { name, logo } });
  },
};

export const categoryModel = {
  list() {
    return prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
  },
  findBySlug(slug) {
    return prisma.productCategory.findUnique({ where: { slug } });
  },
  upsert(slug, name) {
    return prisma.productCategory.upsert({ where: { slug }, update: { name }, create: { slug, name } });
  },
};
