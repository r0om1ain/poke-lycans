import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { catalogApi } from '../../api/catalog.js';
import { CartIcon, GavelIcon, CollectionIcon, MessageIcon } from '../common/Icons.jsx';
import { NavDropdown } from '../common/NavDropdown.jsx';

export function Header() {
  const { user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    catalogApi.categories().then((r) => setCategories(r.categories));
  }, []);

  function onSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('nom', query);
    if (categoryId) params.set('categoryId', categoryId);
    navigate(`/recherche${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <>
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/" className="brand">
            <span className="brand__mark"><span>◆</span></span>
            <span>TCGWorld</span>
          </Link>

          <NavDropdown trigger="Pokémon ▾" triggerClassName="game-switcher">
            <div className="nav-dropdown-label">Jeu actuel</div>
            <span className="nav-dropdown-current">✓ Pokémon</span>
            <div className="nav-dropdown-label" style={{ marginTop: 6 }}>D’autres jeux arriveront bientôt</div>
          </NavDropdown>

          <nav className="header-nav">
            <NavLink to="/encheres"><GavelIcon /> Enchères</NavLink>
            <NavLink to="/collection"><CollectionIcon /> Collection</NavLink>
          </nav>

          <nav className="account-nav" aria-label="Compte">
            {user && (
              <>
                <NavDropdown trigger="Vendre ▾" triggerClassName="nav-trigger" align="right">
                  <Link to="/ventes">Mes ventes</Link>
                  <Link to="/mes-offres">Mes offres</Link>
                  <Link to="/recherche">Vendre des articles</Link>
                </NavDropdown>
                <NavDropdown trigger="Acheter ▾" triggerClassName="nav-trigger" align="right">
                  <Link to="/achats">Mes achats</Link>
                  <Link to="/mes-encheres">Mes enchères</Link>
                  <Link to="/panier">Mon panier</Link>
                </NavDropdown>
                <Link to="/compte/messages" className="icon-btn" aria-label="Messages">
                  <MessageIcon />
                </Link>
              </>
            )}
            <Link to="/panier" className="icon-btn" aria-label="Panier">
              <CartIcon />
              {cart.summary.itemCount > 0 && <span className="cart-count">{cart.summary.itemCount}</span>}
            </Link>
            {user ? (
              <NavDropdown trigger={user.username} triggerClassName="nav-trigger nav-trigger--user" align="right">
                <Link to="/compte">Mon compte</Link>
                <Link to="/compte/messages">Mes messages</Link>
                <Link to="/achats">Mes achats</Link>
                <Link to="/ventes">Mes ventes</Link>
              </NavDropdown>
            ) : (
              <>
                <Link to="/connexion" className="nav-trigger">Connexion</Link>
                <Link to="/inscription" className="btn btn-primary btn-sm">Créer un compte</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="nav-shell">
        <div className="container nav-shell__inner">
          <NavDropdown trigger="◈ Produits ▾" triggerClassName="products-button">
            <Link to="/recherche">Tous les produits</Link>
            <hr />
            {categories.map((c) => (
              <Link key={c.id} to={`/recherche?categoryId=${c.id}`}>{c.name}</Link>
            ))}
          </NavDropdown>
          <form className="search-form" onSubmit={onSearch}>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Catégorie">
              <option value="">Tout</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
