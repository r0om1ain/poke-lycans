import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../api/catalog.js';
import { ordersApi } from '../api/orders.js';
import { auctionsApi } from '../api/auctions.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useApi.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ProductThumb } from '../components/product/ProductThumb.jsx';
import { AuctionCard } from '../components/auction/AuctionCard.jsx';
import { ScrollRow } from '../components/common/ScrollRow.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { ErrorState } from '../components/common/EmptyState.jsx';
import { EyeIcon, GavelIcon } from '../components/common/Icons.jsx';
import { getRecentlyViewed } from '../lib/recentlyViewed.js';
import { formatPrice } from '../lib/format.js';
import { productUrl } from '../lib/productUrl.js';

const QUICK_LINKS = [
  { icon: '▣', title: 'Cartes', subtitle: 'Singles et variantes', slug: 'card' },
  { icon: '▤', title: 'Boosters', subtitle: "Packs à l'unité", slug: 'booster' },
  { icon: '▦', title: 'Displays', subtitle: 'Boîtes de boosters', slug: 'display' },
  { icon: '◇', title: 'Produits scellés', subtitle: 'ETB et coffrets', slug: 'coffret' },
];

function Podium({ items }) {
  return (
    <div className="podium">
      {items.slice(0, 3).map((p, i) => (
        <Link key={p.id} to={productUrl(p)} className="podium-card">
          <ProductThumb product={p} className="podium-thumb">
            <span className="podium-rank">{i + 1}</span>
          </ProductThumb>
          <h4 className="podium-name">{p.name}</h4>
          {p.fromPrice != null && <p className="podium-price">{formatPrice(p.fromPrice)}</p>}
        </Link>
      ))}
    </div>
  );
}

function RankingList({ items }) {
  if (items.length === 0) return null;
  return (
    <ol className="ranking-list" start={4}>
      {items.slice(3, 8).map((p) => (
        <li key={p.id}>
          <Link to={productUrl(p)}>{p.name}</Link>
          {p.fromPrice != null && <strong>{formatPrice(p.fromPrice)}</strong>}
        </li>
      ))}
    </ol>
  );
}

function useTasks(enabled) {
  const [tasks, setTasks] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    Promise.all([ordersApi.purchases(), ordersApi.sales(), auctionsApi.mine()]).then(
      ([purchases, sales, auctions]) => {
        const list = [];
        if (purchases.counts.AWAITING_PAYMENT > 0) {
          list.push({
            label: `${purchases.counts.AWAITING_PAYMENT} commande${purchases.counts.AWAITING_PAYMENT > 1 ? 's' : ''} à payer`,
            to: '/achats',
          });
        }
        if (sales.counts.PAID > 0) {
          list.push({
            label: `${sales.counts.PAID} vente${sales.counts.PAID > 1 ? 's' : ''} à expédier`,
            to: '/ventes',
          });
        }
        const won = [...auctions.created, ...auctions.participated].filter(
          (a) => a.status === 'ENDED' && !a.hasOrder && a.winnerId,
        );
        if (won.length > 0) {
          list.push({
            label: `${won.length} enchère${won.length > 1 ? 's' : ''} remportée${won.length > 1 ? 's' : ''} à finaliser`,
            to: '/mes-encheres',
          });
        }
        setTasks(list);
      },
    );
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
          <div className="home-section-title">
            <h2>Tâches</h2>
          </div>
          <div className="widget-panel">
            {tasks === null ? (
              <LoadingBlock />
            ) : tasks.length === 0 ? (
              <p className="widget-empty">Rien en attente pour l’instant.</p>
            ) : (
              <ul className="task-list">
                {tasks.map((t) => (
                  <li key={t.label}>
                    <Link to={t.to}>{t.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <div className="home-section-title">
            <h2>Notifications</h2>
          </div>
          <div className="widget-panel">
            <p className="widget-empty">Vous êtes à jour, aucune notification.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function useBargains() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    catalogApi.search({ availableOnly: true, pageSize: 30 }).then((r) => {
      const sorted = [...r.items]
        .filter((p) => p.fromPrice != null)
        .sort((a, b) => a.fromPrice - b.fromPrice);
      setItems(sorted.slice(0, 8));
    });
  }, []);
  return items;
}

export function Home() {
  const { data, loading, error, refresh } = useFetch(() => catalogApi.home(), []);
  const { data: recentlyViewed } = useFetch(() => catalogApi.byIds(getRecentlyViewed()), []);
  const { data: categories } = useFetch(() => catalogApi.categories(), []);
  const { data: series } = useFetch(() => catalogApi.series(), []);
  const bargains = useBargains();

  if (loading) return <LoadingBlock />;
  if (error) {
    return (
      <div className="page">
        <ErrorState message={error.message} action={<button className="btn btn-secondary" onClick={refresh}>Réessayer</button>} />
      </div>
    );
  }

  const categoryIdBySlug = Object.fromEntries((categories?.categories ?? []).map((c) => [c.slug, c.id]));

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
            <Link className="btn btn-primary" to="/recherche">Voir les produits</Link>
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
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.slug}
              to={`/recherche${categoryIdBySlug[q.slug] ? `?categoryId=${categoryIdBySlug[q.slug]}` : ''}`}
              className="quick-card"
            >
              <span className="quick-card__icon">{q.icon}</span>
              <strong>{q.title}</strong>
              <span>{q.subtitle}</span>
            </Link>
          ))}
        </div>
      </section>

      <TasksNotifications />

      {recentlyViewed?.items?.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="home-section-title">
              <div>
                <p className="eyebrow eyebrow--dark">HISTORIQUE</p>
                <h2><EyeIcon style={{ verticalAlign: 'middle', marginRight: 6 }} />Vus précédemment</h2>
              </div>
            </div>
            <ScrollRow>
              {recentlyViewed.items.map((p) => (
                <ProductCard key={p.id} product={p} />
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
            <Link to="/recherche">Tout voir →</Link>
          </div>

          <div className="trends-grid">
            <article className="trend-panel">
              <h3>Meilleures ventes</h3>
              {data.bestSellers.length > 0 ? (
                <>
                  <Podium items={data.bestSellers} />
                  <RankingList items={data.bestSellers} />
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

      {series?.series?.length > 0 && (
        <section className="home-section home-section--soft">
          <div className="container">
            <div className="home-section-title">
              <div>
                <p className="eyebrow eyebrow--dark">CATALOGUE</p>
                <h2>Parcourir les extensions</h2>
              </div>
            </div>
            <div className="sets-grid">
              {series.series.slice(0, 8).map((s) => (
                <Link key={s.id} to={`/recherche?seriesId=${s.id}`} className="set-card">
                  <div className="set-card__thumb">{s.code}</div>
                  <div>
                    <strong>{s.name}</strong>
                    <span>Voir l’extension</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.endingSoonAuctions.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="home-section-title">
              <div>
                <p className="eyebrow eyebrow--dark">ENCHÈRES</p>
                <h2><GavelIcon style={{ verticalAlign: 'middle', marginRight: 6 }} />Se terminant bientôt</h2>
              </div>
              <Link to="/encheres">Toutes les enchères →</Link>
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {data.endingSoonAuctions.map((a) => (
                <AuctionCard key={a.id} auction={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
