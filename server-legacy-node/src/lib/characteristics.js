// Specs §6-§9 : caractéristiques facultatives d'un exemplaire (carte, offre,
// enchère, collection). ON/OFF (§7) + gradation (§8). Centralisé ici pour que
// modèles, contrôleurs et filtres restent en phase avec les mêmes champs.
//
// `language` et `gradingCompany` sont des clés étrangères vers des tables de
// référence (Language, GradingCompany) plutôt que du texte libre — voir
// schema.prisma — donc les clés manipulées ici sont `languageId` /
// `gradingCompanyId`.

export const BOOLEAN_CHARACTERISTIC_KEYS = [
  'holo',
  'firstEdition',
  'pokeball',
  'miscutMisprint',
  'stamp',
  'reverse',
];

export const GRADING_KEYS = ['graded', 'gradingCompanyId', 'gradingNote'];

// state + languageId ne sont pas des ON/OFF mais font partie des mêmes
// "informations possibles d'un exemplaire" (§9).
export const EXEMPLAR_FIELDS = [
  'state',
  'languageId',
  ...BOOLEAN_CHARACTERISTIC_KEYS,
  ...GRADING_KEYS,
];

// Ordre qualité, du meilleur au pire (7 états Cardmarket : Mint, Near Mint,
// Excellent, Good, Light Played, Played, Poor).
const VALID_STATES = ['MINT', 'NM', 'EXCELLENT', 'GOOD', 'LP', 'PLAYED', 'POOR'];

// Cardmarket ne filtre pas la recherche sur un état exact mais sur un seuil
// "Condition min." : renvoie tous les états au moins aussi bons que celui
// choisi.
export function statesAtLeast(minState) {
  const idx = VALID_STATES.indexOf(minState);
  if (idx === -1) return undefined;
  return VALID_STATES.slice(0, idx + 1);
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return undefined;
}

// Extrait les champs d'exemplaire d'un payload (body de création) en ne
// gardant que ce qui est explicitement fourni — tout reste facultatif.
export function pickExemplarFields(source = {}) {
  const result = {};

  if (source.state !== undefined && source.state !== null && source.state !== '') {
    const state = String(source.state).toUpperCase();
    if (VALID_STATES.includes(state)) result.state = state;
  }
  if (source.languageId) result.languageId = String(source.languageId);

  for (const key of BOOLEAN_CHARACTERISTIC_KEYS) {
    const value = toBoolean(source[key]);
    if (value !== undefined) result[key] = value;
  }

  const graded = toBoolean(source.graded);
  if (graded !== undefined) result.graded = graded;
  if (graded) {
    if (source.gradingCompanyId) result.gradingCompanyId = String(source.gradingCompanyId);
    if (source.gradingNote) result.gradingNote = String(source.gradingNote);
  }

  return result;
}

// Construit un filtre Prisma `where` à partir de query params de recherche
// (specs §12, §18, §39) : mêmes clés, valeurs ON/OFF, ids de lookup, ou texte.
// `state` y est interprété comme "Condition min." (seuil), contrairement à
// pickExemplarFields où il reste une valeur exacte (création d'une offre).
export function buildExemplarWhere(query = {}) {
  const picked = pickExemplarFields(query);
  if (picked.state) {
    const states = statesAtLeast(picked.state);
    if (states) picked.state = { in: states };
  }
  return picked;
}
