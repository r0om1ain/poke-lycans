import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog.js';
import { SingleCard } from '../components/product/SingleCard.jsx';
import { FilterSidebar } from '../components/filters/FilterSidebar.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';

const SORTS = [
  { key: 'recent', label: 'Plus récent' },
  { key: 'price-asc', label: 'Prix croissant' },
  { key: 'price-desc', label: 'Prix décroissant' },
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

function paginationRange(page, totalPages) {
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
}

export function Search() {
  const [searchParams] = useSearchParams();
  const categoryIdFromUrl = searchParams.get('categoryId') ?? '';
  const seriesIdFromUrl = searchParams.get('seriesId') ?? '';
  const nameFromUrl = searchParams.get('nom') ?? '';

  const [filters, setFilters] = useState({ categoryId: categoryIdFromUrl || undefined, seriesId: seriesIdFromUrl || undefined });
  const [name, setName] = useState(nameFromUrl);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('recent');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);

  useEffect(() => setName(nameFromUrl), [nameFromUrl]);
  useEffect(() => {
    setFilters((f) => ({ ...f, categoryId: categoryIdFromUrl || undefined, seriesId: seriesIdFromUrl || undefined }));
  }, [categoryIdFromUrl, seriesIdFromUrl]);
  useEffect(() => setPage(1), [filters, name]);

  useEffect(() => {
    catalogApi.categories().then((r) => setCategories(r.categories));
    catalogApi.series().then((r) => setSeries(r.series));
  }, []);

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
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  const categoryName = categories.find((c) => c.id === filters.categoryId)?.name ?? 'Cartes & produits';

  return (
    <div className="catalog-page">
      <div className="container catalog-main">
        <nav className="breadcrumb">
          <Link to="/">Accueil</Link>
          <span>/</span>
          <Link to="/recherche">Produits (Pokémon)</Link>
          <span>/</span>
          <span>{categoryName}</span>
        </nav>

        <div className="catalog-heading">
          <div>
            <h1>{categoryName}</h1>
            <p>Parcourez le catalogue de cartes et produits Pokémon disponibles sur la marketplace.</p>
          </div>
        </div>

        <section className="catalog-toolbar">
          <label className="catalog-select">
            <span>Catégorie</span>
            <select
              className="select"
              value={filters.categoryId ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value || undefined }))}
            >
              <option value="">Toutes</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="catalog-select">
            <span>Édition</span>
            <select
              className="select"
              value={filters.seriesId ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, seriesId: e.target.value || undefined }))}
            >
              <option value="">Toutes les extensions</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>

          <label className="catalog-search">
            <span>Nom</span>
            <input className="input" type="search" placeholder="Ex. Pikachu" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <button type="button" className="btn btn-primary filter-action" onClick={() => setMobileFiltersOpen((v) => !v)}>
            Filtres
          </button>
        </section>

        <button type="button" className="btn btn-secondary catalog-mobile-toggle" onClick={() => setMobileFiltersOpen((v) => !v)}>
          Filtres avancés {mobileFiltersOpen ? '▲' : '▼'}
        </button>

        <div className="catalog-layout">
          <FilterSidebar filters={filters} onChange={setFilters} showAvailability className={mobileFiltersOpen ? 'open' : ''} />

          <section className="catalog-results">
            {loading && <LoadingBlock />}
            {!loading && error && <ErrorState message={error.message} />}
            {!loading && !error && result && (
              <>
                <div className="results-bar">
                  <div className="results-bar-info">
                    <strong>{categoryName}</strong>
                    <span>{result.total} résultat{result.total > 1 ? 's' : ''}</span>
                  </div>
                  <label>
                    Trier par
                    <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                      {SORTS.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {items.length === 0 ? (
                  <EmptyState title="Aucun résultat" description="Essayez d’élargir vos filtres." />
                ) : (
                  <div className="singles-grid">
                    {items.map((p) => (
                      <SingleCard key={p.id} product={p} />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <nav className="pagination" aria-label="Pagination">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                    {paginationRange(page, totalPages).map((p, i, arr) => (
                      <span key={p} style={{ display: 'contents' }}>
                        {i > 0 && arr[i - 1] !== p - 1 && <span>…</span>}
                        <button type="button" className={p === page ? 'is-active' : ''} onClick={() => setPage(p)}>
                          {p}
                        </button>
                      </span>
                    ))}
                    <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
