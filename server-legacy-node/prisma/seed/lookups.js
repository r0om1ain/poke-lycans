import { languageModel, gradingCompanyModel, categoryModel } from '../../src/models/lookupModel.js';

// Langues courantes pour des cartes Pokémon (specs §12 : "autres langues disponibles")
const LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'Anglais' },
  { code: 'jp', name: 'Japonais' },
  { code: 'de', name: 'Allemand' },
  { code: 'it', name: 'Italien' },
  { code: 'es', name: 'Espagnol' },
];

// Sociétés de gradation citées en exemple dans les specs (§8) + les plus
// courantes du marché — extensible depuis l'admin plus tard.
const GRADING_COMPANIES = [
  { name: 'PSA' },
  { name: 'PCA' },
  { name: 'BGS' },
  { name: 'CGC' },
  { name: 'ACE' },
];

// Catégories de produits citées dans les specs (§3, §12) + "autres produits
// Pokémon présents dans le catalogue"
const CATEGORIES = [
  { slug: 'card', name: 'Carte' },
  { slug: 'etb', name: 'ETB' },
  { slug: 'display', name: 'Display' },
  { slug: 'booster', name: 'Booster' },
  { slug: 'coffret', name: 'Coffret' },
  { slug: 'other', name: 'Autre' },
];

export async function seedLookups() {
  for (const l of LANGUAGES) await languageModel.upsert(l.code, l.name);
  for (const g of GRADING_COMPANIES) await gradingCompanyModel.upsert(g.name, g.logo ?? null);
  for (const c of CATEGORIES) await categoryModel.upsert(c.slug, c.name);
  console.log(`[seed] lookups: ${LANGUAGES.length} langues, ${GRADING_COMPANIES.length} sociétés de gradation, ${CATEGORIES.length} catégories`);
}
