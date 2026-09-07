'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { catalogApi } from '@/lib/api/catalog';
import { CartIcon, GavelIcon, CollectionIcon, MessageIcon } from '../common/Icons';
import { NavDropdown } from '../common/NavDropdown';
import type { TypeItem } from '@/types';

// "Catégorie" n'existe plus (Product unifié supprimé) : le sélecteur propose
// "Toutes les cartes" (kind=carte) puis un datTypeItem par produit scellé.
export function Header() {
  const { user } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [kindValue, setKindValue] = useState('');
  const [typeItems, setTypeItems] = useState<TypeItem[]>([]);

  useEffect(() => {
    catalogApi.typesItem().then((r) => setTypeItems(r)).catch(() => {});
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('nom', query);
    if (kindValue === 'carte') params.set('kind', 'carte');
    else if (kindValue) params.set('typeItemId', kindValue);
    router.push(`/recherche${params.toString() ? `?${params}` : ''}`);
  }

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <header className="topbar">
        <div className="container topbar__inner">
          <Link href="/" className="brand">
            <span className="brand__mark"><span>◆</span></span>
            <span>TCGWorld</span>
          </Link>

          <NavDropdown trigger="Pokémon ▾" triggerClassName="game-switcher">
            <div className="nav-dropdown-label">Jeu actuel</div>
            <span className="nav-dropdown-current">✓ Pokémon</span>
            <div className="nav-dropdown-label" style={{ marginTop: 6 }}>D’autres jeux arriveront bientôt</div>
          </NavDropdown>

          <nav className="header-nav">
            <Link href="/encheres" className={isActive('/encheres') ? 'active' : ''}><GavelIcon /> Enchères</Link>
            <Link href="/collection" className={isActive('/collection') ? 'active' : ''}><CollectionIcon /> Collection</Link>
          </nav>

          <nav className="account-nav" aria-label="Compte">
            {user && (
              <>
                <NavDropdown trigger="Vendre ▾" triggerClassName="nav-trigger" align="right">
                  <Link href="/ventes">Mes ventes</Link>
                  <Link href="/mes-offres">Mes offres</Link>
                  <Link href="/recherche">Vendre des articles</Link>
                </NavDropdown>
                <NavDropdown trigger="Acheter ▾" triggerClassName="nav-trigger" align="right">
                  <Link href="/achats">Mes achats</Link>
                  <Link href="/mes-encheres">Mes enchères</Link>
                  <Link href="/panier">Mon panier</Link>
                </NavDropdown>
                <Link href="/compte/messages" className="icon-btn" aria-label="Messages">
                  <MessageIcon />
                </Link>
              </>
            )}
            <Link href="/panier" className="icon-btn" aria-label="Panier">
              <CartIcon />
              {cart.summary.nombreArticles > 0 && <span className="cart-count">{cart.summary.nombreArticles}</span>}
            </Link>
            {user ? (
              <NavDropdown trigger={user.pseudo} triggerClassName="nav-trigger nav-trigger--user" align="right">
                <Link href="/compte">Mon compte</Link>
                <Link href="/compte/messages">Mes messages</Link>
                <Link href="/achats">Mes achats</Link>
                <Link href="/ventes">Mes ventes</Link>
              </NavDropdown>
            ) : (
              <>
                <Link href="/connexion" className="nav-trigger">Connexion</Link>
                <Link href="/inscription" className="btn btn-primary btn-sm">Créer un compte</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="nav-shell">
        <div className="container nav-shell__inner">
          <NavDropdown trigger="◈ Produits ▾" triggerClassName="products-button">
            <Link href="/recherche">Tous les produits</Link>
            <Link href="/recherche?kind=carte">Cartes</Link>
            <hr />
            {typeItems.map((t) => (
              <Link key={t.id} href={`/recherche?typeItemId=${t.id}`}>{t.nom}</Link>
            ))}
          </NavDropdown>
          <form className="search-form" onSubmit={onSearch}>
            <select value={kindValue} onChange={(e) => setKindValue(e.target.value)} aria-label="Type de produit">
              <option value="">Tout</option>
              <option value="carte">Cartes</option>
              {typeItems.map((t) => (
                <option key={t.id} value={String(t.id)}>{t.nom}</option>
              ))}
            </select>
            <input
              type="search"
              placeholder="Rechercher sur la marketplace..."
              aria-label="Rechercher"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Rechercher</button>
          </form>
        </div>
      </div>
    </>
  );
}
