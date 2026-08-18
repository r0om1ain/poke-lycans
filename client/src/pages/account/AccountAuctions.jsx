import { auctionsApi } from '../../api/auctions.js';
import { useFetch } from '../../hooks/useApi.js';
import { AuctionCard } from '../../components/auction/AuctionCard.jsx';
import { LoadingBlock } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export function AccountAuctions() {
  const { data, loading } = useFetch(() => auctionsApi.mine(), []);

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>Mes enchères</h2>

      <section className="section">
        <div className="section-header"><h3 className="section-title">Créées par moi</h3></div>
        {data.created.length === 0 ? (
          <EmptyState title="Aucune enchère créée" />
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {data.created.map((a) => <AuctionCard key={a.id} auction={a} />)}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header"><h3 className="section-title">Auxquelles je participe</h3></div>
        {data.participated.length === 0 ? (
          <EmptyState title="Vous ne participez à aucune enchère" />
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {data.participated.map((a) => <AuctionCard key={a.id} auction={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}
