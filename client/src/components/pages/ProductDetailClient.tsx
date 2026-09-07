'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { catalogApi } from '@/lib/api/catalog';
import { listingsApi } from '@/lib/api/listings';
import { messagesApi } from '@/lib/api/messages';
import { uploadUrl } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFetch } from '@/hooks/useFetch';
import { SeriesLabel } from '@/components/product/SeriesLabel';
import { ListingRow } from '@/components/product/ListingRow';
import { QuickSellPanel } from '@/components/product/QuickSellPanel';
import { QuickAuctionPanel } from '@/components/product/QuickAuctionPanel';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { LoadingBlock } from '@/components/common/Spinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { pushRecentlyViewed } from '@/lib/recentlyViewed';
import { formatPrice } from '@/lib/format';
import { productUrl } from '@/lib/productUrl';
import type { Annonce, CarteDetail, EnchereDetail, ExemplarFilters, ItemDetail, ItemKind } from '@/types';

// NB : le backend ne renvoie plus activeAuctionCount/reprints sur la fiche
// produit (CarteDetailDto/ItemDetailDto sont minimalistes) — ces deux blocs
// sont retirés ; le compte d'offres/prix mini est recalculé côté client à
// partir des annonces effectivement chargées.
export function ProductDetailClient({ kind, id, seriesCode, slug }: { kind: ItemKind; id?: number; seriesCode?: string; slug?: string }) {
  const { user } = useAuth();
  const { add } = useCart();
  const router = useRouter();

  const { data: product, loading, error } = useFetch<CarteDetail | ItemDetail>(
    () => (id != null ? catalogApi.produit(kind, id) : catalogApi.produitBySlug(kind, seriesCode!, slug!)),
    [kind, id, seriesCode, slug],
  );
  const itemId = product?.id;
  const typeItem = kind === 'item' ? (product as ItemDetail | undefined)?.type : undefined;
  const rarete = kind === 'carte' ? (product as CarteDetail | undefined)?.rarete : undefined;

  // Vieux lien "/produits/:kind/:id" pour un produit qui a bien une série+slug :
  // on bascule discrètement l'URL vers sa forme lisible, sans rechargement.
  useEffect(() => {
    if (id != null && product?.serie?.code && product.slug) {
      router.replace(`/produits/${kind}/${product.serie.code}/${product.slug}`);
    }
  }, [id, product, router, kind]);

  const [filters, setFilters] = useState<ExemplarFilters>({});
  const [listings, setListings] = useState<Annonce[] | null>(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [sellOpen, setSellOpen] = useState(false);
  const [auctionOpen, setAuctionOpen] = useState(false);
  const [createdAuction, setCreatedAuction] = useState<EnchereDetail | null>(null);

  useEffect(() => {
    if (itemId == null) return;
    pushRecentlyViewed(kind, itemId);
    setFilters({});
    setSellOpen(false);
    setAuctionOpen(false);
    setCreatedAuction(null);
  }, [itemId, kind]);

  function refreshListings() {
    if (itemId == null) return undefined;
    setListingsLoading(true);
    return listingsApi
      .forProduct(kind, itemId, filters as Record<string, unknown>)
      .then((items) => setListings(items))
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false));
  }

  useEffect(() => {
    refreshListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, filters]);

  function onListingCreated() {
    setSellOpen(false);
    refreshListings();
  }

  function onAuctionCreated(auction: EnchereDetail) {
    setAuctionOpen(false);
    setCreatedAuction(auction);
  }

  async function onAddToCart(listing: Annonce) {
    if (!user) return router.push('/connexion');
    setAddingId(listing.id);
    try {
      await add(listing.id, 1);
    } finally {
      setAddingId(null);
    }
  }

  async function onContact(listing: Annonce) {
    if (!user) return router.push('/connexion');
    const conversation = await messagesApi.contact({ idAnnonce: listing.id });
    router.push(`/compte/messages/${conversation.id}`);
  }

  if (loading) return <LoadingBlock />;
  if (error) return <div className="page"><ErrorState message={error.message} /></div>;
  if (!product) return null;

  const activeListingCount = listings?.length ?? 0;
  const fromPrice = listings && listings.length > 0 ? Math.min(...listings.map((l) => Number(l.prix))) : null;

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <Link href="/recherche">Produits (Pokémon)</Link>
        {typeItem && (
          <>
            <span>/</span>
            <Link href={`/recherche?idTypeItem=${typeItem.id}`}>{typeItem.nom}</Link>
          </>
        )}
        {kind === 'carte' && (
          <>
            <span>/</span>
            <Link href="/recherche?type=carte">Cartes</Link>
          </>
        )}
        {product.serie && (
          <>
            <span>/</span>
            <Link href={`/recherche?idSerie=${product.serie.id}`}>{product.serie.label}</Link>
          </>
        )}
        <span>/</span>
        <span>{product.nom}</span>
      </nav>

      <div className="product-hero">
        <div className="product-hero-img">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={uploadUrl(product.image) ?? undefined} alt={product.nom} />
          ) : null}
        </div>
        <div className="product-hero-info">
          <h1>{product.nom}</h1>
          <SeriesLabel series={product.serie} />
          {typeItem && <p style={{ marginTop: 'var(--space-2)' }}><span className="badge badge-neutral">{typeItem.nom}</span></p>}
          {rarete && <p style={{ marginTop: 'var(--space-2)' }}><span className="badge badge-neutral">{rarete}</span></p>}

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
                  <QuickSellPanel kind={kind} itemId={product.id} onCreated={onListingCreated} onCancel={() => setSellOpen(false)} />
                </div>
              )}

              {auctionOpen && (
                <div className="quick-panel-wrap">
                  <QuickAuctionPanel kind={kind} itemId={product.id} onCreated={onAuctionCreated} onCancel={() => setAuctionOpen(false)} />
                </div>
              )}

              {createdAuction && (
                <p className="quick-panel-success">
                  Enchère créée — <Link href={`/encheres/${createdAuction.id}`}>voir l’enchère</Link>
                </p>
              )}
            </>
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
            {!listingsLoading && listings && listings.length > 0 && (
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
