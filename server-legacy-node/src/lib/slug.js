// Slug lisible pour les URLs produit ("/produits/:seriesCode/:slug") — pas
// de colonne stockée, calculé à la volée à partir du nom (+ numéro de carte
// pour désambiguïser, la plupart des cartes en ayant un).
const COMBINING_DIACRITICS = new RegExp('[̀-ͯ]', 'g');

export function slugify(str) {
  return String(str)
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function productSlug(product) {
  const base = slugify(product.name);
  return product.cardNumber ? `${base}-${slugify(product.cardNumber)}` : base;
}
