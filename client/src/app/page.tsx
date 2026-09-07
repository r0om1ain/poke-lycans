'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { catalogApi } from '@/lib/api/catalog';
import { ordersApi } from '@/lib/api/orders';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductThumb } from '@/components/product/ProductThumb';
import { AuctionCard } from '@/components/auction/AuctionCard';
import { ScrollRow } from '@/components/common/ScrollRow';
import { LoadingBlock } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/EmptyState';
import { EyeIcon, GavelIcon } from '@/components/common/Icons';
import { recentlyViewedApi } from '@/lib/api/account';
import { formatPrice } from '@/lib/format';
import { productUrl } from '@/lib/productUrl';
import type { ProduitResume, Serie } from '@/types';

function Podium({ items }: { items: ProduitResume[] }) {
  return (
    <div className="podium">
      {items.slice(0, 3).map((p, i) => (
        <Link key={`${p.type}-${p.id}`} href={productUrl(p)} className="podium-card">
          <ProductThumb product={p} className="podium-thumb">
            <span className="podium-rank">{i + 1}</span>
          </ProductThumb>
          <h4 className="podium-name">{p.nom}</h4>
          {p.prixMin != null && <p className="podium-price">{formatPrice(p.prixMin)}</p>}
        </Link>
      ))}
    </div>
  );
}

function RankingList({ items }: { items: ProduitResume[] }) {
  if (items.length === 0) return null;
  return (
    <ol className="ranking-list" start={4}>
      {items.slice(3, 8).map((p) => (
        <li key={`${p.type}-${p.id}`}>
          <Link href={productUrl(p)}>{p.nom}</Link>
          {p.prixMin != null && <strong>{formatPrice(p.prixMin)}</strong>}
        </li>
      ))}
    </ol>
  );
}

// Statuts de commande (datStatutCommande.StcCode, seedés côté backend) :
// CREEE -> PAYEE -> EXPEDIEE -> RECUE.
function useTasks(enabled: boolean) {
  const [tasks, setTasks] = useState<{ label: string; to: string }[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    Promise.all([ordersApi.purchases(), ordersApi.sales()]).then(([purchases, sales]) => {
      const list: { label: string; to: string }[] = [];
      const aPayer = purchases.filter((o) => o.statut === 'CREEE').length;
      if (aPayer > 0) list.push({ label: `${aPayer} commande${aPayer > 1 ? 's' : ''} à payer`, to: '/achats' });
      const aExpedier = sales.filter((o) => o.statut === 'PAYEE').length;
      if (aExpedier > 0) list.push({ label: `${aExpedier} vente${aExpedier > 1 ? 's' : ''} à expédier`, to: '/ventes' });
      setTasks(list);
    }).catch(() => setTasks([]));
  }, [enabled]);
  return tasks;
}

function TasksNotifications() {
  const { user } = useAuth();
  const tasks = useTasks(Boolean(user));
  if (!user) return null;

  return (
    <section className="home-section">
      <div className="container tasks-notifications-grid">
        <div>
          <div className="home-section-title"><h2>Tâches</h2></div>
          <div className="widget-panel">
            {tasks === null ? (
              <LoadingBlock />
            ) : tasks.length === 0 ? (
              <p className="widget-empty">Rien en attente pour l’instant.</p>
            ) : (
              <ul className="task-list">
                {tasks.map((t) => (
                  <li key={t.label}>
                    <Link href={t.to}>{t.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <div className="home-section-title"><h2>Notifications</h2></div>
          <div className="widget-panel">
            <p className="widget-empty">Vous êtes à jour, aucune notification.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function useBargains() {
  const [items, setItems] = useState<ProduitResume[] | null>(null);
  useEffect(() => {
    catalogApi
      .search({ availableOnly: true, pageSize: 30 })
      .then((r) => {
        const sorted = [...r.resultats]
          .filter((p) => p.prixMin != null)
          .sort((a, b) => (a.prixMin as number) - (b.prixMin as number));
        setItems(sorted.slice(0, 8));
      })
      .catch(() => setItems([]));
  }, []);
  return items;
}

export default function Home() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useFetch(() => catalogApi.home(), []);
  const { data: recentlyViewed } = useFetch<ProduitResume[]>(
    () => (user ? recentlyViewedApi.list() : Promise.resolve([])),
    [user],
  );
  const { data: series } = useFetch<Serie[]>(() => catalogApi.series(), []);
  const bargains = useBargains();

  if (loading) return <LoadingBlock />;
  if (error) {
    return (
      <div className="page">
        <ErrorState message={error.message} action={<button className="btn btn-secondary" onClick={refresh}>Réessayer</button>} />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div>
      <section className="hero">
        <div className="container hero__content">
          <div className="hero__copy">
            <p className="eyebrow">MARKETPLACE POKÉMON</p>
            <h1>Découvrez les dernières cartes Pokémon</h1>
            <p>
              Achetez et vendez cartes, boosters, displays et produits scellés sur une
              marketplace dédiée aux collectionneurs.
            </p>
            <Link className="btn btn-primary" href="/recherche">Voir les produits</Link>
          </div>
          <div className="hero__art" aria-hidden="true">
            <div className="card-shape card-shape--1" />
            <div className="card-shape card-shape--2" />
            <div className="card-shape card-shape--3" />
          </div>
        </div>
      </section>

      <section className="quick-links">
        <div className="container quick-links__grid">
          <Link href="/recherche?type=carte" className="quick-card">
            <span className="quick-card__icon">▣</span>
            <strong>Cartes</strong>
            <span>Singles et variantes</span>
          </Link>
          <Link href="/recherche" className="quick-card">
            <span className="quick-card__icon">◇</span>
            <strong>Produits scellés</strong>
            <span>ETB, displays, boosters...</span>
          </Link>
        </div>
      </section>

      <TasksNotifications />

      {recentlyViewed && recentlyViewed.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="home-section-title">
              <div>
                <p className="eyebrow eyebrow--dark">HISTORIQUE</p>
                <h2><EyeIcon style={{ verticalAlign: 'middle', marginRight: 6 }} />Vus précédemment</h2>
              </div>
            </div>
            <ScrollRow>
              {recentlyViewed.map((entry) => (
                <ProductCard key={`${entry.type}-${entry.id}`} product={entry} />
              ))}
            </ScrollRow>
          </div>
        </section>
      )}

      <section className="home-section" id="trends">
        <div className="container">
          <div className="home-section-title">
            <div>
              <p className="eyebrow eyebrow--dark">TENDANCES</p>
              <h2>Les produits du moment</h2>
            </div>
            <Link href="/recherche">Tout voir →</Link>
          </div>

          <div className="trends-grid">
            <article className="trend-panel">
              <h3>Meilleures ventes</h3>
              {data.tendances.length > 0 ? (
                <>
                  <Podium items={data.tendances} />
                  <RankingList items={data.tendances} />
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pas encore de ventes enregistrées.</p>
              )}
            </article>

            <article className="trend-panel">
              <h3>Bonnes affaires</h3>
              {bargains === null ? (
                <LoadingBlock />
              ) : bargains.length > 0 ? (
                <>
                  <Podium items={bargains} />
                  <RankingList items={bargains} />
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucune offre disponible pour l’instant.</p>
              )}
            </article>
          </div>
        </div>
      </section>

      {series && series.length > 0 && (
        <section className="home-section home-section--soft">
          <div className="container">
            <div className="home-section-title">
              <div>
                <p className="eyebrow eyebrow--dark">CATALOGUE</p>
                <h2>Parcourir les extensions</h2>
              </div>
            </div>
            <div className="sets-grid">
              {series.slice(0, 8).map((s) => (
                <Link key={s.id} href={`/recherche?idSerie=${s.id}`} className="set-card">
                  <div className="set-card__thumb">{s.code}</div>
                  <div>
                    <strong>{s.nom}</strong>
                    <span>Voir l’extension</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.encheresBientotTerminees.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="home-section-title">
              <div>
                <p className="eyebrow eyebrow--dark">ENCHÈRES</p>
                <h2><GavelIcon style={{ verticalAlign: 'middle', marginRight: 6 }} />Se terminant bientôt</h2>
              </div>
              <Link href="/encheres">Toutes les enchères →</Link>
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {data.encheresBientotTerminees.map((a) => (
                <AuctionCard key={a.id} auction={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
