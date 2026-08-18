import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auctionsApi } from '../api/auctions.js';
import { accountApi } from '../api/account.js';
import { sellersApi } from '../api/sellers.js';
import { uploadUrl, ApiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useApi.js';
import { SeriesLabel } from '../components/product/SeriesLabel.jsx';
import { ExemplarBadges } from '../components/product/ExemplarBadges.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { ErrorState } from '../components/common/EmptyState.jsx';
import { formatCountdown, formatDateTime, formatPrice } from '../lib/format.js';

function BidBox({ auction, onBid }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!user) return navigate('/connexion');
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
          min={Number(auction.currentPrice) + 0.01}
          className="input"
          placeholder={`Min. ${formatPrice(Number(auction.currentPrice) + 0.01)}`}
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

function FinalizePurchase({ auction }) {
  const { data: addresses } = useFetch(() => accountApi.listAddresses(), []);
  const { data: shipping } = useFetch(() => sellersApi.shippingMethods(auction.seller.id), [auction.seller.id]);
  const navigate = useNavigate();
  const [addressId, setAddressId] = useState('');
  const [shippingMethodId, setShippingMethodId] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { order } = await auctionsApi.finalizePurchase(auction.id, {
        addressId,
        shippingMethodId: shippingMethodId || undefined,
      });
      navigate(`/compte/achats`, { state: { orderId: order.id } });
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
          <label htmlFor="addressId">Adresse de livraison</label>
          <select id="addressId" className="select" required value={addressId} onChange={(e) => setAddressId(e.target.value)}>
            <option value="">Sélectionner une adresse</option>
            {addresses?.addresses.map((a) => (
              <option key={a.id} value={a.id}>{a.label} — {a.city}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="shippingMethodId">Mode de livraison</label>
          <select id="shippingMethodId" className="select" value={shippingMethodId} onChange={(e) => setShippingMethodId(e.target.value)}>
            <option value="">Aucun</option>
            {shipping?.shippingMethods.map((m) => (
              <option key={m.id} value={m.id}>{m.name} — {formatPrice(m.price)}</option>
            ))}
          </select>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !addressId}>
          {submitting ? 'Validation...' : 'Finaliser l’achat'}
        </button>
      </form>
    </div>
  );
}

export function AuctionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, loading, error, refresh } = useFetch(() => auctionsApi.detail(id), [id]);

  if (loading) return <LoadingBlock />;
  if (error) return <div className="page"><ErrorState message={error.message} /></div>;
  if (!data) return null;

  const { auction, bids } = data;
  const isWinner = auction.status === 'ENDED' && auction.winnerId === user?.id;

  return (
    <div className="page">
      <div className="product-hero">
        <div>
          {auction.photos.length > 0 ? (
            <div className="photo-gallery">
              {auction.photos.map((p) => (
                <img key={p} src={uploadUrl(p)} alt={auction.product.name} />
              ))}
            </div>
          ) : (
            <div className="product-hero-img">
              {auction.product.imageUrl && <img src={uploadUrl(auction.product.imageUrl)} alt={auction.product.name} />}
            </div>
          )}
        </div>
        <div className="product-hero-info">
          <h1>{auction.product.name}</h1>
          <SeriesLabel series={auction.product.series} />
          <p style={{ marginTop: 'var(--space-2)' }}>
            Vendu par <strong>{auction.seller.username}</strong>
          </p>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <ExemplarBadges item={auction} />
          </div>

          {auction.description && <p style={{ marginTop: 'var(--space-3)', color: 'var(--text-secondary)' }}>{auction.description}</p>}

          <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: 'var(--space-6)' }}>
            <div>
              <div className="auction-current-price-label">Prix actuel</div>
              <span className="price" style={{ fontSize: '1.6rem' }}>{formatPrice(auction.currentPrice)}</span>
            </div>
            <div>
              <div className="auction-current-price-label">Fin</div>
              <span className="countdown-badge">{auction.status === 'ACTIVE' ? formatCountdown(auction.endAt) : 'Terminée'}</span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatDateTime(auction.endAt)}</div>
            </div>
          </div>

          {auction.hasReserve && (
            <p style={{ marginTop: 'var(--space-2)' }}>
              <span className={`badge ${auction.reserveMet ? 'badge-success' : 'badge-warning'}`}>
                Prix de réserve {auction.reserveMet ? 'atteint' : 'non atteint'}
              </span>
            </p>
          )}

          {auction.status === 'ACTIVE' && <div style={{ marginTop: 'var(--space-4)' }}><BidBox auction={auction} onBid={refresh} /></div>}
          {isWinner && !auction.hasOrder && <FinalizePurchase auction={auction} />}

          {bids.length > 0 && (
            <div className="bid-list">
              {bids.map((bid) => (
                <div key={bid.id} className="bid-list-row">
                  <span>{bid.user.username}</span>
                  <span className="price">{formatPrice(bid.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
