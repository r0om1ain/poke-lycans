import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sellersApi } from '../api/sellers.js';
import { messagesApi } from '../api/messages.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useApi.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';
import { formatDate, formatPrice } from '../lib/format.js';

export function SellerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(() => sellersApi.profile(id), [id]);

  const [activeCategory, setActiveCategory] = useState(null);
  const [listings, setListings] = useState(null);

  useEffect(() => {
    sellersApi.listings(id, { categoryId: activeCategory }).then((r) => setListings(r.items));
  }, [id, activeCategory]);

  async function contactSeller() {
    if (!user) return navigate('/connexion');
    const { conversation } = await messagesApi.contact({ sellerId: id });
    navigate(`/compte/messages/${conversation.id}`);
  }

  if (loading) return <LoadingBlock />;
  if (error) return <div className="page"><ErrorState message={error.message} /></div>;
  if (!data) return null;

  const { seller, salesCount, categoryCounts } = data;

  return (
    <div className="page">
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{seller.username}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
              {seller.country ? `${seller.country} · ` : ''}Membre depuis {formatDate(seller.memberSince)} · {salesCount} vente{salesCount > 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <span className="badge badge-success">{seller.ratingPositive ?? 0} positives</span>
              <span className="badge badge-neutral">{seller.ratingNeutral ?? 0} neutres</span>
              <span className="badge badge-warning">{seller.ratingNegative ?? 0} négatives</span>
            </div>
          </div>
          {user?.id !== id && (
            <button type="button" className="btn btn-primary" onClick={contactSeller}>Contacter le vendeur</button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>
          Tout
        </button>
        {Object.entries(categoryCounts).map(([slug, { name, count, id: categoryId }]) => (
          <button
            key={slug}
            className={`tab ${activeCategory === categoryId ? 'active' : ''}`}
            onClick={() => setActiveCategory(categoryId)}
          >
            {name} <span className="tab-count">({count})</span>
          </button>
        ))}
      </div>

      {!listings ? (
        <LoadingBlock />
      ) : listings.length === 0 ? (
        <EmptyState title="Aucun article en vente" />
      ) : (
        <div className="grid-products">
          {listings.map((listing) => (
            <ProductCard key={listing.id} product={listing.product} price={formatPrice(listing.price)} />
          ))}
        </div>
      )}
    </div>
  );
}
