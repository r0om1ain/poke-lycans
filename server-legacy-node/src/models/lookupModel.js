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

// Ordre d'affichage logique (catalogue > singles > produits scellés), plutôt
// que l'ordre alphabétique — les nouvelles catégories non listées ici
// tombent à la fin, triées par nom.
const CATEGORY_ORDER = ['card', 'booster', 'display', 'coffret', 'etb', 'other'];

export const categoryModel = {
  async list() {
    const categories = await prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
    return categories.sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a.slug);
      const ib = CATEGORY_ORDER.indexOf(b.slug);
      if (ia === -1 && ib === -1) return a.name.localeCompare(b.name);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  },
  findBySlug(slug) {
    return prisma.productCategory.findUnique({ where: { slug } });
  },
  upsert(slug, name) {
    return prisma.productCategory.upsert({ where: { slug }, update: { name }, create: { slug, name } });
  },
};
