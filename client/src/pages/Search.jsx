import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { FilterPanel } from '../components/filters/FilterPanel.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';
import { uploadUrl } from '../api/client.js';
import { formatPrice } from '../lib/format.js';

const SORTS = [
  { key: 'recent', label: 'Plus récent' },
  { key: 'price-asc', label: 'Moins chères d’abord' },
  { key: 'price-desc', label: 'Plus chères d’abord' },
  { key: 'name-asc', label: 'Nom (A-Z)' },
  { key: 'name-desc', label: 'Nom (Z-A)' },
];

function sortItems(items, sort) {
  const copy = [...items];
  if (sort === 'name-asc') copy.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'name-desc') copy.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === 'price-asc') copy.sort((a, b) => (a.fromPrice ?? Infinity) - (b.fromPrice ?? Infinity));
  if (sort === 'price-desc') copy.sort((a, b) => (b.fromPrice ?? -Infinity) - (a.fromPrice ?? -Infinity));
  return copy;
}

export function Search() {
  const [searchParams] = useSearchParams();
  const nameFromUrl = searchParams.get('nom') ?? '';

  const [filters, setFilters] = useState({});
  const [name, setName] = useState(nameFromUrl);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('recent');
  const [view, setView] = useState('grid');

  useEffect(() => setName(nameFromUrl), [nameFromUrl]);
  useEffect(() => setPage(1), [filters, name]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    catalogApi
      .search({ ...filters, name, page, pageSize: 24 })
      .then((data) => !cancelled && setResult(data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters, name, page]);

  const items = useMemo(() => sortItems(result?.items ?? [], sort), [result, sort]);

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link>
        <span>/</span>
        <Link to="/recherche">Produits (Pokémon)</Link>
        <span>/</span>
        <span>Cartes</span>
      </nav>
      <h1 className="page-title">Cartes</h1>

      <FilterPanel filters={filters} onChange={setFilters} nameValue={name} onNameChange={setName} />

      {!loading && !error && result && (
        <div className="sort-row">
          <label>Trier par</label>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorState message={error.message} />}
      {!loading && !error && result && (
        <>
          <div className="results-toolbar">
            <span>{result.total} résultat{result.total > 1 ? 's' : ''}</span>
            <div className="view-toggle">
              <button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>Liste</button>
              <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Grille</button>
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyState title="Aucun résultat" description="Essayez d’élargir vos filtres." />
          ) : view === 'grid' ? (
            <div className="grid-products">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="row-list">
              {items.map((p) => (
                <Link key={p.id} to={`/produits/${p.id}`} className="list-row-item">
                  <div className="list-row-thumb">{p.imageUrl && <img src={uploadUrl(p.imageUrl)} alt="" />}</div>
                  <div className="list-row-main">
                    <div className="list-row-name" style={{ color: 'var(--link)' }}>{p.name}</div>
                    {p.series && <div className="list-row-series">{p.series.label}</div>}
                  </div>
                  {p.fromPrice != null && <span className="price">À partir de {formatPrice(p.fromPrice)}</span>}
                </Link>
              ))}
            </div>
          )}

          {result.total > result.pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Précédent
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page * result.pageSize >= result.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
