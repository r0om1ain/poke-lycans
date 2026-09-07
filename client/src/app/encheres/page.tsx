'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { auctionsApi } from '@/lib/api/auctions';
import { catalogApi } from '@/lib/api/catalog';
import { AuctionCard } from '@/components/auction/AuctionCard';
import { LoadingBlock } from '@/components/common/Spinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import type { EnchereResume, Serie } from '@/types';

const PAGE_SIZE = 24;

// NB : AuctionController.List n'accepte que idSerie/page/pageSize côté backend
// (pas de filtre type/nom/caractéristiques, pas de total renvoyé) — filtres
// et pagination simplifiés en conséquence par rapport à /recherche.
function AuctionsInner() {
  const searchParams = useSearchParams();
  const idSerieFromUrl = searchParams.get('idSerie') ?? '';

  const [idSerie, setIdSerie] = useState<number | undefined>(idSerieFromUrl ? Number(idSerieFromUrl) : undefined);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<EnchereResume[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [series, setSeries] = useState<Serie[]>([]);

  useEffect(() => setPage(1), [idSerie]);

  useEffect(() => {
    catalogApi.series().then(setSeries).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    auctionsApi
      .list({ idSerie, page, pageSize: PAGE_SIZE })
      .then((data) => !cancelled && setItems(data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [idSerie, page]);

  const hasNextPage = (items?.length ?? 0) === PAGE_SIZE;

  return (
    <div className="catalog-page">
      <div className="container catalog-main">
        <nav className="breadcrumb">
          <Link href="/">Accueil</Link>
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
            <span>Édition</span>
            <select className="select" value={idSerie ?? ''} onChange={(e) => setIdSerie(e.target.value ? Number(e.target.value) : undefined)}>
              <option value="">Toutes les extensions</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="catalog-results">
          {loading && <LoadingBlock />}
          {!loading && error && <ErrorState message={error.message} />}
          {!loading && !error && items && (
            <>
              {items.length === 0 ? (
                <EmptyState title="Aucune enchère en cours" description="Revenez plus tard ou modifiez vos filtres." />
              ) : (
                <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                  {items.map((a) => (
                    <AuctionCard key={a.id} auction={a} />
                  ))}
                </div>
              )}

              {(page > 1 || hasNextPage) && (
                <nav className="pagination" aria-label="Pagination">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Précédent</button>
                  <span className="is-active">{page}</span>
                  <button type="button" disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>Suivant ›</button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AuctionsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <AuctionsInner />
    </Suspense>
  );
}
