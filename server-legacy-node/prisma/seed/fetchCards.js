import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { prisma } from '../../src/config/prisma.js';
import { seriesModel } from '../../src/models/seriesModel.js';
import { categoryModel } from '../../src/models/lookupModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TCGDEX_BASE = 'https://api.tcgdex.net/v2/fr';

// Cartes récupérées via l'API TCGdex (guide : GUIDE_RECUPERATION_TCG.md §2).
// La liste des sets à importer est configurée dans seedSets.json — étendre
// cette liste (nouveau set = un objet { tcgdexId, code, name }) puis relancer
// le seed suffit à agrandir le catalogue, sans toucher au code.
export async function fetchCards() {
  const sets = JSON.parse(readFileSync(path.join(__dirname, 'seedSets.json'), 'utf-8'));
  const cardCategory = await categoryModel.findBySlug('card');
  if (!cardCategory) throw new Error('Catégorie "card" introuvable — lancer seedLookups() avant fetchCards()');

  let totalCards = 0;

  for (const set of sets) {
    const res = await fetch(`${TCGDEX_BASE}/sets/${set.tcgdexId}`);
    if (!res.ok) {
      console.warn(`[seed] set ${set.tcgdexId} introuvable sur TCGdex (${res.status}), ignoré`);
      continue;
    }
    const data = await res.json();

    const series = await seriesModel.upsert(set.code, set.name);

    for (const card of data.cards ?? []) {
      await prisma.product.upsert({
        where: { tcgdexId: card.id },
        update: {
          name: card.name,
          cardNumber: card.localId,
          imageUrl: `${card.image}/high.webp`,
          seriesId: series.id,
        },
        create: {
          tcgdexId: card.id,
          name: card.name,
          cardNumber: card.localId,
          imageUrl: `${card.image}/high.webp`,
          seriesId: series.id,
          categoryId: cardCategory.id,
        },
      });
      totalCards += 1;
    }

    console.log(`[seed] ${set.code} : ${data.cards?.length ?? 0} cartes (${set.name})`);
  }

  console.log(`[seed] cartes : ${totalCards} au total sur ${sets.length} sets`);
}
