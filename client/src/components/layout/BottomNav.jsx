import { NavLink } from 'react-router-dom';
import { HomeIcon, SearchIcon, GavelIcon, CollectionIcon, CartIcon } from '../common/Icons.jsx';
import { useCart } from '../../context/CartContext.jsx';

const items = [
  { to: '/', label: 'Accueil', icon: HomeIcon, end: true },
  { to: '/recherche', label: 'Recherche', icon: SearchIcon },
  { to: '/encheres', label: 'Enchères', icon: GavelIcon },
  { to: '/collection', label: 'Collection', icon: CollectionIcon },
  { to: '/panier', label: 'Panier', icon: CartIcon },
];

export function BottomNav() {
  const { cart } = useCart();
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} style={{ position: 'relative' }}>
          <Icon />
          {to === '/panier' && cart.summary.itemCount > 0 && (
            <span className="cart-count" style={{ top: 0, right: '28%' }}>{cart.summary.itemCount}</span>
          )}
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
