import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog.js';
import { listingsApi } from '../api/listings.js';
import { messagesApi } from '../api/messages.js';
import { uploadUrl } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useFetch } from '../hooks/useApi.js';
import { SeriesLabel } from '../components/product/SeriesLabel.jsx';
import { ListingRow } from '../components/product/ListingRow.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';
import { pushRecentlyViewed } from '../lib/recentlyViewed.js';

export function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  const { data, loading, error } = useFetch(() => catalogApi.productDetail(id), [id]);
  const [listings, setListings] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    pushRecentlyViewed(id);
  }, [id]);

  useEffect(() => {
    setListingsLoading(true);
    listingsApi
      .forProduct(id)
      .then((r) => setListings(r.listings))
      .finally(() => setListingsLoading(false));
  }, [id]);

  async function onAddToCart(listing) {
    if (!user) return navigate('/connexion');
    setAddingId(listing.id);
    try {
      await add(listing.id, 1);
    } finally {
      setAddingId(null);
    }
  }

  async function onContact(listing) {
    if (!user) return navigate('/connexion');
    const { conversation } = await messagesApi.contact({ listingId: listing.id });
    navigate(`/compte/messages/${conversation.id}`);
  }

  if (loading) return <LoadingBlock />;
  if (error) return <div className="page"><ErrorState message={error.message} /></div>;
  if (!data) return null;

  const { product, activeAuctionCount } = data;

  return (
    <div className="page">
      <div className="product-hero">
        <div className="product-hero-img">
          {product.imageUrl ? <img src={uploadUrl(product.imageUrl)} alt={product.name} /> : null}
        </div>
        <div className="product-hero-info">
          <h1>{product.name}</h1>
          <SeriesLabel series={product.series} />
          {product.category && <p style={{ marginTop: 'var(--space-2)' }}><span className="badge badge-neutral">{product.category.name}</span></p>}

          {activeAuctionCount > 0 && (
            <Link
              to={`/encheres?nom=${encodeURIComponent(product.name)}`}
              className="badge badge-auction"
              style={{ marginTop: 'var(--space-3)', display: 'inline-flex' }}
            >
              {activeAuctionCount} enchère{activeAuctionCount > 1 ? 's' : ''} en cours
            </Link>
          )}

          {user && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
              <Link to={`/produits/${id}/vendre`} className="btn btn-primary">Mettre en vente</Link>
              <Link to={`/produits/${id}/encherir`} className="btn btn-secondary">Créer une enchère</Link>
            </div>
          )}
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Offres disponibles</h2>
        </div>

        {listingsLoading && <LoadingBlock />}
        {!listingsLoading && listings?.length === 0 && (
          <EmptyState title="Aucune offre pour l’instant" description="Soyez le premier à vendre ce produit." />
        )}
        {!listingsLoading && listings?.length > 0 && (
          <div className="row-list">
            {listings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                onAddToCart={onAddToCart}
                onContact={onContact}
                adding={addingId === listing.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
