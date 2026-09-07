'use client';

import Link from 'next/link';
import { auctionsApi } from '@/lib/api/auctions';
import { useFetch } from '@/hooks/useFetch';
import { AuctionCard } from '@/components/auction/AuctionCard';
import { LoadingBlock } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { EnchereResume } from '@/types';

// NB : AuctionController.Mine renvoie une liste unique (créées + participées
// confondues, le backend ne distingue plus les deux) — plus de sections séparées.
export default function MyAuctionsPage() {
  const { data, loading } = useFetch<EnchereResume[]>(() => auctionsApi.mine(), []);

  if (loading || !data) return <LoadingBlock />;

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <span>Mes enchères</span>
      </nav>
      <h1 className="page-title">Mes enchères</h1>

      <section className="section">
        {data.length === 0 ? (
          <EmptyState title="Aucune enchère" />
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {data.map((a) => <AuctionCard key={a.id} auction={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}
