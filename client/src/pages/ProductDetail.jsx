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
import { QuickSellPanel } from '../components/product/QuickSellPanel.jsx';
import { QuickAuctionPanel } from '../components/product/QuickAuctionPanel.jsx';
import { FilterSidebar } from '../components/filters/FilterSidebar.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { EmptyState, ErrorState } from '../components/common/EmptyState.jsx';
import { pushRecentlyViewed } from '../lib/recentlyViewed.js';
import { formatPrice } from '../lib/format.js';
import { productUrl } from '../lib/productUrl.js';

export function ProductDetail() {
  // Deux formes d'URL possibles : "/produits/:id" (repli) et
  // "/produits/:seriesCode/:slug" (URL lisible, voir lib/productUrl.js).
  const { id, seriesCode, slug } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  const { data, loading, error } = useFetch(
    () => (id ? catalogApi.productDetail(id) : catalogApi.productDetailBySlug(seriesCode, slug)),
    [id, seriesCode, slug],
  );
  const productId = data?.product?.id;

  // Vieux lien "/produits/:id" pour un produit qui a bien une série+slug :
  // on bascule discrètement l'URL vers sa forme lisible, sans rechargement.
  useEffect(() => {
    if (id && data?.product?.series?.code && data.product.slug) {
      navigate(productUrl(data.product), { replace: true });
    }
  }, [id, data]);

  const [filters, setFilters] = useState({});
  const [listings, setListings] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [sellOpen, setSellOpen] = useState(false);
  const [auctionOpen, setAuctionOpen] = useState(false);
  const [createdAuction, setCreatedAuction] = useState(null);

  useEffect(() => {
    if (!productId) return;
    pushRecentlyViewed(productId);
    setFilters({});
    setSellOpen(false);
    setAuctionOpen(false);
    setCreatedAuction(null);
  }, [productId]);

  function refreshListings() {
    if (!productId) return;
    setListingsLoading(true);
    return listingsApi
      .forProduct(productId, filters)
      .then((r) => setListings(r.listings))
      .finally(() => setListingsLoading(false));
  }

  useEffect(() => {
    refreshListings();
  }, [productId, filters]);

  function onListingCreated() {
    setSellOpen(false);
    refreshListings();
  }

  function onAuctionCreated(auction) {
    setAuctionOpen(false);
    setCreatedAuction(auction);
  }

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

  const { product, activeAuctionCount, activeListingCount, reprints } = data;
  const fromPrice = listings?.length > 0 ? Math.min(...listings.map((l) => Number(l.price))) : null;

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link>
        <span>/</span>
        <Link to="/recherche">Produits (Pokémon)</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/recherche?categoryId=${product.category.id}`}>{product.category.name}</Link>
          </>
        )}
        {product.series && (
          <>
            <span>/</span>
            <Link to={`/recherche?seriesId=${product.series.id}`}>{product.series.label}</Link>
          </>
        )}
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-hero">
        <div className="product-hero-img">
          {product.imageUrl ? <img src={uploadUrl(product.imageUrl)} alt={product.name} /> : null}
        </div>
        <div className="product-hero-info">
          <h1>{product.name}</h1>
          <SeriesLabel series={product.series} />
          {product.category && <p style={{ marginTop: 'var(--space-2)' }}><span className="badge badge-neutral">{product.category.name}</span></p>}

          <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            <div>
              <div className="auction-current-price-label">Articles disponibles</div>
              <strong>{activeListingCount}</strong>
            </div>
            {fromPrice != null && (
              <div>
                <div className="auction-current-price-label">De</div>
                <span className="price">{formatPrice(fromPrice)}</span>
              </div>
            )}
          </div>

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
            <>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                <button
                  type="button"
                  className={`btn ${sellOpen ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => { setSellOpen((v) => !v); setAuctionOpen(false); }}
                >
                  {sellOpen ? 'Fermer' : 'Mettre en vente'}
                </button>
                <button
                  type="button"
                  className={`btn ${auctionOpen ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setAuctionOpen((v) => !v); setSellOpen(false); setCreatedAuction(null); }}
                >
                  {auctionOpen ? 'Fermer' : 'Créer une enchère'}
                </button>
              </div>

              {sellOpen && (
                <div className="quick-panel-wrap">
                  <QuickSellPanel productId={product.id} onCreated={onListingCreated} onCancel={() => setSellOpen(false)} />
                </div>
              )}

              {auctionOpen && (
                <div className="quick-panel-wrap">
                  <QuickAuctionPanel productId={product.id} onCreated={onAuctionCreated} onCancel={() => setAuctionOpen(false)} />
                </div>
              )}

              {createdAuction && (
                <p className="quick-panel-success">
                  Enchère créée — <Link to={`/encheres/${createdAuction.id}`}>voir l’enchère</Link>
                </p>
              )}
            </>
          )}

          {reprints?.length > 0 && (
            <div style={{ marginTop: 'var(--space-5)' }}>
              <div className="auction-current-price-label" style={{ marginBottom: 6 }}>Autres éditions de cette carte</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {reprints.map((r) => (
                  <Link key={r.id} to={productUrl(r)} className="badge badge-neutral">
                    {r.series?.label ?? r.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Offres disponibles</h2>
        </div>

        <div className="catalog-layout">
          <FilterSidebar filters={filters} onChange={setFilters} title="Filtres" />

          <div className="catalog-results">
            {listingsLoading && <LoadingBlock />}
            {!listingsLoading && listings?.length === 0 && (
              <EmptyState title="Aucune offre pour ces critères" description="Essayez d’élargir les filtres, ou soyez le premier à vendre ce produit." />
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
          </div>
        </div>
      </section>
    </div>
  );
}
