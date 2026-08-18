import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/compte', label: 'Informations personnelles', end: true },
  { to: '/compte/adresses', label: 'Adresses' },
  { to: '/compte/paiement', label: 'Paiement' },
  { to: '/compte/livraison', label: 'Livraison (vendeur)' },
  { to: '/compte/achats', label: 'Mes achats' },
  { to: '/compte/ventes', label: 'Mes ventes' },
  { to: '/compte/encheres', label: 'Mes enchères' },
  { to: '/compte/messages', label: 'Messages' },
];

export function AccountLayout() {
  return (
    <div className="page">
      <h1 className="page-title">Mon compte</h1>
      <div className="account-layout">
        <nav className="account-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
