'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sellersApi } from '@/lib/api/sellers';
import { messagesApi } from '@/lib/api/messages';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingBlock } from '@/components/common/Spinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate, formatPrice } from '@/lib/format';
import type { Annonce, ItemKind, SellerProfile } from '@/types';

// NB : le backend ne renvoie plus de compteurs par type d'article scellé sur
// le profil vendeur (SellerProfileDto n'a que note/nb d'avis) — les onglets
// sont donc calculés côté client à partir de la liste complète des annonces.
export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = use(params);
  const id = Number(idParam);
  const { user } = useAuth();
  const router = useRouter();
  const { data, loading, error } = useFetch<SellerProfile>(() => sellersApi.profile(id), [id]);

  const [activeTab, setActiveTab] = useState<'' | ItemKind>('');
  const [allListings, setAllListings] = useState<Annonce[] | null>(null);

  useEffect(() => {
    sellersApi.listings(id, {}).then(setAllListings).catch(() => {});
  }, [id]);

  const listings = allListings?.filter((a) => !activeTab || a.produit.type === activeTab) ?? null;
  const cardCount = allListings?.filter((a) => a.produit.type === 'carte').length ?? 0;
  const itemCount = allListings?.filter((a) => a.produit.type === 'item').length ?? 0;

  async function contactSeller() {
    if (!user) return router.push('/connexion');
    const conversation = await messagesApi.contact({ idPersonneVendeur: id });
    router.push(`/compte/messages/${conversation.id}`);
  }

  if (loading) return <LoadingBlock />;
  if (error) return <div className="page"><ErrorState message={error.message} /></div>;
  if (!data) return null;

  return (
    <div className="page">
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{data.pseudo}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
              Membre depuis {formatDate(data.dateCreation)}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginTop: 'var(--space-2)' }}>
              {data.nombreEvaluations > 0 ? (
                <span className="badge badge-success">★ {data.noteMoyenne.toFixed(1)} ({data.nombreEvaluations} avis)</span>
              ) : (
                <span className="badge badge-neutral">Aucun avis</span>
              )}
            </div>
          </div>
          {user?.id !== id && (
            <button type="button" className="btn btn-primary" onClick={contactSeller}>Contacter le vendeur</button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${!activeTab ? 'active' : ''}`} onClick={() => setActiveTab('')}>
          Tout
        </button>
        {cardCount > 0 && (
          <button className={`tab ${activeTab === 'carte' ? 'active' : ''}`} onClick={() => setActiveTab('carte')}>
            Cartes <span className="tab-count">({cardCount})</span>
          </button>
        )}
        {itemCount > 0 && (
          <button className={`tab ${activeTab === 'item' ? 'active' : ''}`} onClick={() => setActiveTab('item')}>
            Produits scellés <span className="tab-count">({itemCount})</span>
          </button>
        )}
      </div>

      {!listings ? (
        <LoadingBlock />
      ) : listings.length === 0 ? (
        <EmptyState title="Aucun article en vente" />
      ) : (
        <div className="grid-products">
          {listings.map((listing) => (
            <ProductCard key={listing.id} product={listing.produit} price={formatPrice(listing.prix)} />
          ))}
        </div>
      )}
    </div>
  );
}
