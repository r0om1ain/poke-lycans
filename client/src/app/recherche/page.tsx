'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { catalogApi } from '@/lib/api/catalog';
import { SingleCard } from '@/components/product/SingleCard';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { LoadingBlock } from '@/components/common/Spinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import type { ExemplarFilters, ProduitResume, SearchResult, Serie, TypeItem } from '@/types';

const SORTS = [
  { key: 'recent', label: 'Plus récent' },
  { key: 'price-asc', label: 'Prix croissant' },
  { key: 'price-desc', label: 'Prix décroissant' },
  { key: 'name-asc', label: 'Nom (A-Z)' },
  { key: 'name-desc', label: 'Nom (Z-A)' },
];

function sortItems(items: ProduitResume[], sort: string): ProduitResume[] {
  const copy = [...items];
  if (sort === 'name-asc') copy.sort((a, b) => a.nom.localeCompare(b.nom));
  if (sort === 'name-desc') copy.sort((a, b) => b.nom.localeCompare(a.nom));
  if (sort === 'price-asc') copy.sort((a, b) => (a.prixMin ?? Infinity) - (b.prixMin ?? Infinity));
  if (sort === 'price-desc') copy.sort((a, b) => (b.prixMin ?? -Infinity) - (a.prixMin ?? -Infinity));
  return copy;
}

function paginationRange(page: number, totalPages: number): number[] {
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
}

function SearchInner() {
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get('type') ?? '';
  const typeItemIdFromUrl = searchParams.get('idTypeItem') ?? '';
  const seriesIdFromUrl = searchParams.get('idSerie') ?? '';
  const nameFromUrl = searchParams.get('q') ?? '';

  const [filters, setFilters] = useState<ExemplarFilters>({
    type: typeFromUrl === 'carte' ? 'carte' : undefined,
    idTypeItem: typeItemIdFromUrl ? Number(typeItemIdFromUrl) : undefined,
    idSerie: seriesIdFromUrl ? Number(seriesIdFromUrl) : undefined,
  });
  const [name, setName] = useState(nameFromUrl);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sort, setSort] = useState('recent');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [typeItems, setTypeItems] = useState<TypeItem[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);

  useEffect(() => setName(nameFromUrl), [nameFromUrl]);
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      type: typeFromUrl === 'carte' ? 'carte' : undefined,
      idTypeItem: typeItemIdFromUrl ? Number(typeItemIdFromUrl) : undefined,
      idSerie: seriesIdFromUrl ? Number(seriesIdFromUrl) : undefined,
    }));
  }, [typeFromUrl, typeItemIdFromUrl, seriesIdFromUrl]);
  useEffect(() => setPage(1), [filters, name]);

  useEffect(() => {
    catalogApi.typesItem().then(setTypeItems).catch(() => {});
    catalogApi.series().then(setSeries).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    catalogApi
      .search({ ...filters, q: name, page, pageSize: 24 })
      .then((data) => !cancelled && setResult(data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters, name, page]);

  const items = useMemo(() => sortItems(result?.resultats ?? [], sort), [result, sort]);
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  const categoryName = filters.type === 'carte'
    ? 'Cartes'
    : typeItems.find((t) => t.id === filters.idTypeItem)?.nom ?? 'Cartes & produits';

  return (
    <div className="catalog-page">
      <div className="container catalog-main">
        <nav className="breadcrumb">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <Link href="/recherche">Produits (Pokémon)</Link>
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
            <span>Type</span>
            <select
              className="select"
              value={filters.type === 'carte' ? 'carte' : (filters.idTypeItem ?? '')}
              onChange={(e) => {
                const v = e.target.value;
                setFilters((f) => ({ ...f, type: v === 'carte' ? 'carte' : undefined, idTypeItem: v && v !== 'carte' ? Number(v) : undefined }));
              }}
            >
              <option value="">Tous</option>
              <option value="carte">Cartes</option>
              {typeItems.map((t) => (
                <option key={t.id} value={t.id}>{t.nom}</option>
              ))}
            </select>
          </label>

          <label className="catalog-select">
            <span>Édition</span>
            <select
              className="select"
              value={filters.idSerie ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, idSerie: e.target.value ? Number(e.target.value) : undefined }))}
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
                      <SingleCard key={`${p.type}-${p.id}`} product={p} />
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

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <SearchInner />
    </Suspense>
  );
}
