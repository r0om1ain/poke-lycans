import { prisma } from '../config/prisma.js';
import { pickExemplarFields } from '../lib/characteristics.js';

// Ordre de "relâchement" des critères quand aucune offre ne correspond
// exactement à l'exemplaire recherché — les infos les plus fines sautent en
// premier (specs §50 : "autant que possible" une configuration identique).
const RELAX_ORDER = [
  'gradingNote',
  'gradingCompanyId',
  'graded',
  'miscutMisprint',
  'stamp',
  'pokeball',
  'firstEdition',
  'reverse',
  'holo',
  'languageId',
  'state',
];

function average(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export const pricingService = {
  // criteria: { productId, ...champs d'exemplaire facultatifs }
  async estimateValue(criteria) {
    const { productId } = criteria;
    if (!productId) return null;

    const fullExemplar = pickExemplarFields(criteria);
    let activeKeys = Object.keys(fullExemplar);

    for (let i = 0; i <= RELAX_ORDER.length; i += 1) {
      const where = { productId, status: 'ACTIVE' };
      for (const key of activeKeys) where[key] = fullExemplar[key];

      const listings = await prisma.listing.findMany({ where, select: { price: true } });
      if (listings.length > 0) {
        const prices = listings.map((l) => Number(l.price));
        return {
          estimated: Math.round(average(prices) * 100) / 100,
          min: Math.min(...prices),
          max: Math.max(...prices),
          sampleSize: prices.length,
          exactMatch: activeKeys.length === Object.keys(fullExemplar).length,
          matchedCriteria: activeKeys,
        };
      }

      // Relâche le prochain critère le moins prioritaire encore actif.
      const nextToRelax = RELAX_ORDER.find((key) => activeKeys.includes(key));
      if (!nextToRelax) break;
      activeKeys = activeKeys.filter((key) => key !== nextToRelax);
    }

    // Aucune offre, même sans aucun critère : pas d'estimation possible.
    return null;
  },

  async estimateCollectionItem(item) {
    return pricingService.estimateValue({
      productId: item.productId,
      state: item.state,
      languageId: item.languageId,
      holo: item.holo,
      firstEdition: item.firstEdition,
      pokeball: item.pokeball,
      miscutMisprint: item.miscutMisprint,
      stamp: item.stamp,
      reverse: item.reverse,
      graded: item.graded,
      gradingCompanyId: item.gradingCompanyId,
      gradingNote: item.gradingNote,
    });
  },

  async estimateCollectionTotal(items) {
    let total = 0;
    let priced = 0;
    for (const item of items) {
      const estimate = await pricingService.estimateCollectionItem(item);
      if (estimate) {
        total += estimate.estimated * item.quantity;
        priced += 1;
      }
    }
    return { total: Math.round(total * 100) / 100, pricedItems: priced, totalItems: items.length };
  },
};
