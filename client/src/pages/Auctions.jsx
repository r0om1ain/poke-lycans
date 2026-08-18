import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auctionsApi } from '../api/auctions.js';
import { AuctionCard } from '../components/auction/AuctionCard.jsx';
import { FilterPanel } from '../components/filters/FilterPanel.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';

export function Auctions() {
  const [searchParams] = useSearchParams();
  const nameFromUrl = searchParams.get('nom') ?? '';

  const [filters, setFilters] = useState({});
  const [name, setName] = useState(nameFromUrl);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => setName(nameFromUrl), [nameFromUrl]);
  useEffect(() => setPage(1), [filters, name]);

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

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link>
        <span>/</span>
        <span>Enchères</span>
      </nav>
      <h1 className="page-title">Enchères</h1>

      <FilterPanel filters={filters} onChange={setFilters} nameValue={name} onNameChange={setName} />

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorState message={error.message} />}
      {!loading && !error && result && (
        <>
          <div className="results-toolbar">
            <span>{result.total} enchère{result.total > 1 ? 's' : ''} en cours — tri par fin la plus proche</span>
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
