import { Link, NavLink, Outlet } from 'react-router-dom';

// "Mon compte" (specs §53-56) : réglages personnels + Messages, comme sur
// Cardmarket (Accueil / Compte / Messages). Commandes, offres et enchères
// vivent en pages indépendantes (Accueil / Commandes / ..., Accueil / Stock / ...).
const links = [
  { to: '/compte', label: 'Informations personnelles', end: true },
  { to: '/compte/adresses', label: 'Adresses' },
  { to: '/compte/paiement', label: 'Paiement' },
  { to: '/compte/livraison', label: 'Livraison (vendeur)' },
  { to: '/compte/messages', label: 'Messages' },
];

export function AccountLayout() {
  return (
    <div className="page">
      <h1 className="page-title">Mon compte</h1>
      <div className="account-layout">
        <nav className="account-sidebar-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-soft)', margin: '8px 4px' }} />
          <Link to="/achats">Mes achats</Link>
          <Link to="/ventes">Mes ventes</Link>
          <Link to="/mes-offres">Mes offres</Link>
          <Link to="/mes-encheres">Mes enchères</Link>
        </nav>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
