import { Link } from 'react-router-dom';
import { catalogApi } from '../api/catalog.js';
import { useFetch } from '../hooks/useApi.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { AuctionCard } from '../components/auction/AuctionCard.jsx';
import { ScrollRow } from '../components/common/ScrollRow.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { ErrorState, EmptyState } from '../components/common/EmptyState.jsx';
import { TrendIcon, EyeIcon, SparkleIcon, TagIcon, GavelIcon } from '../components/common/Icons.jsx';
import { getRecentlyViewed } from '../lib/recentlyViewed.js';

function ProductSection({ title, icon: Icon, items, linkTo }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title"><Icon /> {title}</h2>
        {linkTo && <Link to={linkTo} className="section-link">Tout voir</Link>}
      </div>
      <ScrollRow>
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </ScrollRow>
    </section>
  );
}

function RecentlyViewedSection() {
  const { data: items } = useFetch(() => catalogApi.byIds(getRecentlyViewed()), []);
  return <ProductSection title="Vus précédemment" icon={EyeIcon} items={items?.items} linkTo={null} />;
}

export function Home() {
  const { data, loading, error, refresh } = useFetch(() => catalogApi.home(), []);

  if (loading) return <LoadingBlock />;
  if (error) return <div className="page"><ErrorState message={error.message} action={<button className="btn btn-secondary" onClick={refresh}>Réessayer</button>} /></div>;

  const isEmpty =
    data.bestSellers.length === 0 &&
    data.mostViewed.length === 0 &&
    data.newest.length === 0 &&
    data.recentlyListed.length === 0 &&
    data.endingSoonAuctions.length === 0;

  return (
    <div className="page">
      {isEmpty && (
        <EmptyState
          title="Bienvenue sur TCGWorld"
          description="Le catalogue se peuple au fil des ventes. Lancez une recherche pour découvrir les cartes disponibles."
          action={<Link to="/recherche" className="btn btn-primary">Explorer la marketplace</Link>}
        />
      )}

      <RecentlyViewedSection />

      <ProductSection title="Best-sellers" icon={TrendIcon} items={data.bestSellers} linkTo="/recherche" />
      <ProductSection title="Les plus vus" icon={EyeIcon} items={data.mostViewed} linkTo="/recherche" />
      <ProductSection title="Nouveautés" icon={SparkleIcon} items={data.newest} linkTo="/recherche" />
      <ProductSection title="Dernières mises en vente" icon={TagIcon} items={data.recentlyListed} linkTo="/recherche" />

      {data.endingSoonAuctions.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title"><GavelIcon /> Enchères se terminant bientôt</h2>
            <Link to="/encheres" className="section-link">Toutes les enchères</Link>
          </div>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {data.endingSoonAuctions.map((a) => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
