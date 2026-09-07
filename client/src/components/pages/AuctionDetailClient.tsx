'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auctionsApi } from '@/lib/api/auctions';
import { uploadUrl, ApiError } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import { SeriesLabel } from '@/components/product/SeriesLabel';
import { ExemplarBadges } from '@/components/product/ExemplarBadges';
import { LoadingBlock } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatCountdown, formatDateTime, formatPrice } from '@/lib/format';
import { connectAuctionsHub } from '@/lib/signalr';
import { useFetch } from '@/hooks/useFetch';
import type { EnchereDetail, Mise } from '@/types';

function BidBox({ auction, onBid }: { auction: EnchereDetail; onBid: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return router.push('/connexion');
    setError(null);
    setSubmitting(true);
    try {
      await auctionsApi.placeBid(auction.id, Number(amount));
      setAmount('');
      onBid();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Enchère refusée');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="bid-box">
        <input
          type="number"
          step="0.01"
          min={Number(auction.prixCourant) + 0.01}
          className="input"
          placeholder={`Min. ${formatPrice(Number(auction.prixCourant) + 0.01)}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          Enchérir
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}

// Plus de choix de mode de livraison (ShippingMethod supprimé) : la
// finalisation ne demande plus qu'une adresse texte (pas de carnet d'adresses).
function FinalizePurchase({ auction }: { auction: EnchereDetail }) {
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState({
    adresse: user?.adresse ?? '',
    codePostal: user?.codePostal ?? '',
    ville: user?.ville ?? '',
    pays: user?.pays ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const complete = address.adresse && address.codePostal && address.ville && address.pays;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await auctionsApi.finalizePurchase(auction.id, address);
      router.push('/achats');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de finaliser l’achat');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: 'var(--space-4)' }}>
      <h3 style={{ marginBottom: 'var(--space-3)' }}>Félicitations, vous avez remporté cette enchère 🎉</h3>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Adresse de livraison</label>
          <input className="input" placeholder="Adresse" value={address.adresse} onChange={(e) => setAddress((a) => ({ ...a, adresse: e.target.value }))} />
          <input className="input" style={{ marginTop: 6 }} placeholder="Code postal" value={address.codePostal} onChange={(e) => setAddress((a) => ({ ...a, codePostal: e.target.value }))} />
          <input className="input" style={{ marginTop: 6 }} placeholder="Ville" value={address.ville} onChange={(e) => setAddress((a) => ({ ...a, ville: e.target.value }))} />
          <input className="input" style={{ marginTop: 6 }} placeholder="Pays" value={address.pays} onChange={(e) => setAddress((a) => ({ ...a, pays: e.target.value }))} />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !complete}>
          {submitting ? 'Validation...' : 'Finaliser l’achat'}
        </button>
      </form>
    </div>
  );
}

export function AuctionDetailClient({ id }: { id: number }) {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useFetch<EnchereDetail>(() => auctionsApi.detail(id), [id]);
  const hubRef = useRef<ReturnType<typeof connectAuctionsHub> | null>(null);

  // Remplace le rafraîchissement manuel de l'ancien AuctionDetail : le hub
  // pousse "bidPlaced"/"auctionEnded" pour ce groupe d'enchère.
  useEffect(() => {
    const connection = connectAuctionsHub();
    hubRef.current = connection;
    connection.on('bidPlaced', () => refresh());
    connection.on('auctionEnded', () => refresh());
    connection
      .start()
      .then(() => connection.invoke('JoinAuction', id))
      .catch(() => {
        // SignalR indisponible (API pas encore démarrée) — la page reste
        // utilisable, juste sans mise à jour temps réel.
      });
    return () => {
      connection.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingBlock />;
  if (error) return <div className="page"><ErrorState message={error.message} /></div>;
  if (!data) return null;

  const isWinner = data.statut === 'TERMINEE' && data.idPersonneGagnant === user?.id;
  const hasReserve = data.prixReserve != null;
  const reserveMet = data.statut === 'TERMINEE' ? data.idPersonneGagnant != null : Number(data.prixCourant) >= Number(data.prixReserve ?? 0);

  return (
    <div className="page">
      <div className="product-hero">
        <div>
          {data.photos.length > 0 ? (
            <div className="photo-gallery">
              {data.photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p} src={uploadUrl(p) ?? undefined} alt={data.produit.nom} />
              ))}
            </div>
          ) : (
            <div className="product-hero-img">
              {data.produit.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={uploadUrl(data.produit.image) ?? undefined} alt={data.produit.nom} />
              )}
            </div>
          )}
        </div>
        <div className="product-hero-info">
          <h1>{data.produit.nom}</h1>
          <SeriesLabel series={data.produit.serie} />
          <p style={{ marginTop: 'var(--space-2)' }}>
            Vendu par <strong>{data.vendeur.pseudo}</strong>
          </p>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <ExemplarBadges item={data.caracteristiques} />
          </div>

          {data.description && <p style={{ marginTop: 'var(--space-3)', color: 'var(--text-secondary)' }}>{data.description}</p>}

          <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: 'var(--space-6)' }}>
            <div>
              <div className="auction-current-price-label">Prix actuel</div>
              <span className="price" style={{ fontSize: '1.6rem' }}>{formatPrice(data.prixCourant)}</span>
            </div>
            <div>
              <div className="auction-current-price-label">Fin</div>
              <span className="countdown-badge">{data.statut === 'ACTIVE' ? formatCountdown(data.dateFin) : 'Terminée'}</span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatDateTime(data.dateFin)}</div>
            </div>
          </div>

          {hasReserve && (
            <p style={{ marginTop: 'var(--space-2)' }}>
              <span className={`badge ${reserveMet ? 'badge-success' : 'badge-warning'}`}>
                Prix de réserve {reserveMet ? 'atteint' : 'non atteint'}
              </span>
            </p>
          )}

          {data.statut === 'ACTIVE' && <div style={{ marginTop: 'var(--space-4)' }}><BidBox auction={data} onBid={refresh} /></div>}
          {isWinner && <FinalizePurchase auction={data} />}

          {data.mises.length > 0 && (
            <div className="bid-list">
              {data.mises.map((bid: Mise) => (
                <div key={bid.id} className="bid-list-row">
                  <span>{bid.personne.pseudo}</span>
                  <span className="price">{formatPrice(bid.montant)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
