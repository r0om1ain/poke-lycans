import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listingsApi } from '../api/listings.js';
import { uploadUrl } from '../api/client.js';
import { ExemplarBadges } from '../components/product/ExemplarBadges.jsx';
import { SeriesLabel } from '../components/product/SeriesLabel.jsx';
import { FilterSidebar } from '../components/filters/FilterSidebar.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { formatPrice } from '../lib/format.js';
import { productUrl } from '../lib/productUrl.js';

const SORTS = [
  { key: 'recent', label: 'Plus récent' },
  { key: 'price-asc', label: 'Moins chères d’abord' },
  { key: 'price-desc', label: 'Plus chères d’abord' },
  { key: 'name-asc', label: 'Nom (A-Z)' },
  { key: 'name-desc', label: 'Nom (Z-A)' },
];

function sortItems(items, sort) {
  const copy = [...items];
  if (sort === 'name-asc') copy.sort((a, b) => a.product.name.localeCompare(b.product.name));
  if (sort === 'name-desc') copy.sort((a, b) => b.product.name.localeCompare(a.product.name));
  if (sort === 'price-asc') copy.sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === 'price-desc') copy.sort((a, b) => Number(b.price) - Number(a.price));
  return copy;
}

// Une ligne du tableau de stock : nom + vignette, état/langue/commentaire,
// et quantité/prix modifiables directement (édition rapide façon
// Cardmarket Stock/Offers), sans repasser par le formulaire complet.
function StockRow({ listing, index, onUpdated, onRemove }) {
  const [qty, setQty] = useState(listing.quantity);
  const [price, setPrice] = useState(listing.price);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setQty(listing.quantity);
    setPrice(listing.price);
  }, [listing.quantity, listing.price]);

  async function commit(field, raw) {
    const num = Number(raw);
    const current = field === 'quantity' ? listing.quantity : listing.price;
    if (!raw || Number.isNaN(num) || num <= 0) {
      setQty(listing.quantity);
      setPrice(listing.price);
      return;
    }
    if (num === Number(current)) return;
    setSaving(true);
    try {
      const { listing: updated } = await listingsApi.update(listing.id, { [field]: num });
      onUpdated(updated);
    } catch {
      setQty(listing.quantity);
      setPrice(listing.price);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="stock-row">
      <td className="stock-row__num">{index + 1}</td>
      <td className="stock-row__name">
        <div className="stock-row__thumb">
          {listing.product.imageUrl && <img src={uploadUrl(listing.product.imageUrl)} alt="" />}
        </div>
        <div className="stock-row__name-body">
          <Link to={productUrl(listing.product)} className="stock-row__name-link">
            {listing.product.name}
            {listing.product.series?.code && listing.product.cardNumber && (
              <span className="stock-row__code"> ({listing.product.series.code} {listing.product.cardNumber})</span>
            )}
          </Link>
          <SeriesLabel series={listing.product.series} />
        </div>
      </td>
      <td className="stock-row__info">
        <ExemplarBadges item={listing} compact />
        {listing.description && <div className="stock-row__comment">{listing.description}</div>}
      </td>
      <td className="stock-row__offer">
        <input
          type="number"
          min="1"
          className="input input-xs"
          value={qty}
          disabled={saving}
          onChange={(e) => setQty(e.target.value)}
          onBlur={(e) => commit('quantity', e.target.value)}
          aria-label="Quantité disponible"
        />
        <div className="stock-row__price">
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="input input-xs"
            value={price}
            disabled={saving}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={(e) => commit('price', e.target.value)}
            aria-label="Prix"
          />
          <span>€</span>
        </div>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => onRemove(listing.id)}>
          Retirer
        </button>
      </td>
    </tr>
  );
}

// "Mes offres" (Stock/Offers) : mes annonces actives, façon Cardmarket —
// répartition par catégorie puis par série, filtres, tri, tableau de gestion
// du stock avec quantité/prix modifiables directement dans la liste.
export function MyListings() {
  const [facets, setFacets] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [name, setName] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('recent');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi.myFacets(categoryId).then((r) => setFacets(r));
  }, [categoryId]);

  useEffect(() => {
    setSeriesId('');
  }, [categoryId]);

  useEffect(() => {
    setLoading(true);
    listingsApi
      .mine({ categoryId: categoryId || undefined, seriesId: seriesId || undefined, name: name || undefined, ...filters, pageSize: 100 })
      .then((r) => setResult(r))
      .finally(() => setLoading(false));
  }, [categoryId, seriesId, name, filters]);

  const items = useMemo(() => sortItems(result?.items ?? [], sort), [result, sort]);
  const activeCategoryName = facets?.categoryCounts && categoryId
    ? Object.values(facets.categoryCounts).find((c) => c.id === categoryId)?.name
    : null;

  function onUpdated(updated) {
    setResult((r) => ({ ...r, items: r.items.map((i) => (i.id === updated.id ? updated : i)) }));
  }

  async function onRemove(id) {
    await listingsApi.remove(id);
    setResult((r) => ({ ...r, items: r.items.filter((i) => i.id !== id), total: r.total - 1 }));
    listingsApi.myFacets(categoryId).then(setFacets);
  }

  return (
    <div className="catalog-page">
      <div className="container catalog-main">
        <nav className="breadcrumb">
          <Link to="/">Accueil</Link>
          <span>/</span>
          <span>Stock</span>
          <span>/</span>
          {categoryId ? <Link to="/mes-offres" onClick={() => setCategoryId('')}>Mes offres</Link> : <span>Mes offres</span>}
          {activeCategoryName && (
            <>
              <span>/</span>
              <span>{activeCategoryName}</span>
            </>
          )}
        </nav>

        <div className="catalog-heading">
          <div>
            <h1>Mes offres</h1>
            <p>Vos annonces actuellement en vente sur la marketplace — quantité et prix modifiables directement dans la liste.</p>
          </div>
        </div>

        {facets && Object.keys(facets.categoryCounts).length > 0 && (
          <div className="tabs">
            <button className={`tab ${!categoryId ? 'active' : ''}`} onClick={() => setCategoryId('')}>Tout</button>
            {Object.values(facets.categoryCounts).map((c) => (
              <button key={c.id} className={`tab ${categoryId === c.id ? 'active' : ''}`} onClick={() => setCategoryId(c.id)}>
                {c.name} <span className="tab-count">({c.count})</span>
              </button>
            ))}
          </div>
        )}

        <section className="catalog-toolbar" style={{ gridTemplateColumns: '230px 1fr auto' }}>
          <label className="catalog-select">
            <span>Édition</span>
            <select className="select" value={seriesId} onChange={(e) => setSeriesId(e.target.value)}>
              <option value="">Toutes ({facets?.seriesCounts.reduce((s, c) => s + c.count, 0) ?? 0})</option>
              {facets?.seriesCounts.map((s) => (
                <option key={s.id} value={s.id}>{s.label} ({s.count})</option>
              ))}
            </select>
          </label>
          <label className="catalog-search">
            <span>Nom</span>
            <input className="input" type="search" placeholder="Filtrer par nom" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="catalog-select">
            <span>Trier par</span>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </label>
        </section>

        <div className="catalog-layout">
          <FilterSidebar filters={filters} onChange={setFilters} />

          <section className="catalog-results">
            {loading ? (
              <LoadingBlock />
            ) : (
              <>
                <div className="results-bar">
                  <div className="results-bar-info">
                    <strong>{result?.total ?? 0} résultat{(result?.total ?? 0) > 1 ? 's' : ''}</strong>
                  </div>
                </div>

                {items.length === 0 ? (
                  <EmptyState
                    title="Aucune offre pour ces critères"
                    description="Trouvez un produit dans le catalogue puis « Mettre en vente » depuis sa fiche."
                    action={<Link to="/recherche" className="btn btn-primary">Explorer le catalogue</Link>}
                  />
                ) : (
                  <div className="stock-table-wrap">
                    <table className="stock-table">
                      <thead>
                        <tr>
                          <th className="stock-row__num">#</th>
                          <th>Nom</th>
                          <th>Info.</th>
                          <th>Offre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((listing, i) => (
                          <StockRow key={listing.id} listing={listing} index={i} onUpdated={onUpdated} onRemove={onRemove} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
