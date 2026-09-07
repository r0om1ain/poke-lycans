'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, SearchIcon, GavelIcon, CollectionIcon, CartIcon } from '../common/Icons';
import { useCart } from '@/context/CartContext';

const items = [
  { to: '/', label: 'Accueil', icon: HomeIcon, end: true },
  { to: '/recherche', label: 'Recherche', icon: SearchIcon },
  { to: '/encheres', label: 'Enchères', icon: GavelIcon },
  { to: '/collection', label: 'Collection', icon: CollectionIcon },
  { to: '/panier', label: 'Panier', icon: CartIcon },
];

export function BottomNav() {
  const { cart } = useCart();
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, icon: Icon, end }) => {
        const active = end ? pathname === to : pathname.startsWith(to);
        return (
          <Link key={to} href={to} className={active ? 'active' : ''} style={{ position: 'relative' }}>
            <Icon />
            {to === '/panier' && cart.summary.nombreArticles > 0 && (
              <span className="cart-count" style={{ top: 0, right: '28%' }}>{cart.summary.nombreArticles}</span>
            )}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
