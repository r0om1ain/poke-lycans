// URL lisible "/produits/:seriesCode/:slug" quand le produit appartient à
// une série (cas normal) ; repli sur "/produits/:id" sinon (ex. produits
// scellés sans série assignée).
export function productUrl(product) {
  if (product.series?.code && product.slug) {
    return `/produits/${product.series.code}/${product.slug}`;
  }
  return `/produits/${product.id}`;
}
