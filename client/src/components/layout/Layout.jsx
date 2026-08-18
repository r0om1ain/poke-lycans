import { Link, Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';
import { BottomNav } from './BottomNav.jsx';

export function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer__grid">
          <div>
            <strong className="footer__brand">TCGWorld</strong>
            <p>Marketplace communautaire d’achat et de vente de cartes et produits Pokémon.</p>
          </div>
          <div>
            <strong>Marketplace</strong>
            <Link to="/recherche">Cartes &amp; produits</Link>
            <Link to="/encheres">Enchères</Link>
            <Link to="/collection">Collection</Link>
          </div>
          <div>
            <strong>Compte</strong>
            <Link to="/compte">Mon compte</Link>
            <Link to="/panier">Panier</Link>
            <Link to="/connexion">Connexion</Link>
          </div>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
