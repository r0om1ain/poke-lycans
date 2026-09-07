import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auctionsApi } from '../api/auctions.js';
import { catalogApi } from '../api/catalog.js';
import { AuctionCard } from '../components/auction/AuctionCard.jsx';
import { FilterSidebar } from '../components/filters/FilterSidebar.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';

function paginationRange(page, totalPages) {
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
}

export function Auctions() {
  const [searchParams] = useSearchParams();
  const nameFromUrl = searchParams.get('nom') ?? '';

  const [filters, setFilters] = useState({});
  const [name, setName] = useState(nameFromUrl);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);

  useEffect(() => setName(nameFromUrl), [nameFromUrl]);
  useEffect(() => setPage(1), [filters, name]);

  useEffect(() => {
    catalogApi.categories().then((r) => setCategories(r.categories));
    catalogApi.series().then((r) => setSeries(r.series));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    auctionsApi
      .list({ ...filters, name, page, pageSize: 24 })
      .then((data) => !cancelled && setResult(data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters, name, page]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <div className="catalog-page">
      <div className="container catalog-main">
        <nav className="breadcrumb">
          <Link to="/">Accueil</Link>
          <span>/</span>
          <span>Enchères</span>
        </nav>

        <div className="catalog-heading">
          <div>
            <h1>Enchères</h1>
            <p>Enchères en cours, triées par fin la plus proche.</p>
          </div>
        </div>

        <section className="catalog-toolbar">
          <label className="catalog-select">
            <span>Catégorie</span>
            <select className="select" value={filters.categoryId ?? ''} onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value || undefined }))}>
              <option value="">Toutes</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="catalog-select">
            <span>Édition</span>
            <select className="select" value={filters.seriesId ?? ''} onChange={(e) => setFilters((f) => ({ ...f, seriesId: e.target.value || undefined }))}>
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
          <button type="button" className="btn btn-primary filter-action" onClick={() => setMobileFiltersOpen((v) => !v)}>Filtres</button>
        </section>

        <button type="button" className="btn btn-secondary catalog-mobile-toggle" onClick={() => setMobileFiltersOpen((v) => !v)}>
          Filtres avancés {mobileFiltersOpen ? '▲' : '▼'}
        </button>

        <div className="catalog-layout">
          <FilterSidebar filters={filters} onChange={setFilters} showPrice={false} className={mobileFiltersOpen ? 'open' : ''} />

          <section className="catalog-results">
            {loading && <LoadingBlock />}
            {!loading && error && <ErrorState message={error.message} />}
            {!loading && !error && result && (
              <>
                <div className="results-bar">
                  <div className="results-bar-info">
                    <strong>{result.total} enchère{result.total > 1 ? 's' : ''} en cours</strong>
                    <span>Tri par fin la plus proche</span>
                  </div>
                </div>

                {result.items.length === 0 ? (
                  <EmptyState title="Aucune enchère en cours" description="Revenez plus tard ou modifiez vos filtres." />
                ) : (
                  <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                    {result.items.map((a) => (
                      <AuctionCard key={a.id} auction={a} />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <nav className="pagination" aria-label="Pagination">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                    {paginationRange(page, totalPages).map((p, i, arr) => (
                      <span key={p} style={{ display: 'contents' }}>
                        {i > 0 && arr[i - 1] !== p - 1 && <span>…</span>}
                        <button type="button" className={p === page ? 'is-active' : ''} onClick={() => setPage(p)}>{p}</button>
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
