import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { CartIcon, MessageIcon, SearchIcon, UserIcon } from '../common/Icons.jsx';

export function Header() {
  const { user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function onSearch(e) {
    e.preventDefault();
    navigate(`/recherche${query ? `?nom=${encodeURIComponent(query)}` : ''}`);
  }

  return (
    <>
      <div className="header-top">
        <Link to="/" className="brand">
          TCG<span>World</span>
        </Link>
        <span className="brand-scope">Pokémon</span>

        <nav className="header-nav">
          <NavLink to="/recherche" end>Marketplace</NavLink>
          <NavLink to="/encheres">Enchères</NavLink>
          <NavLink to="/collection">Collection</NavLink>
        </nav>

        <div className="header-actions">
          {user && (
            <Link to="/compte/messages" className="icon-btn" aria-label="Messages">
              <MessageIcon />
            </Link>
          )}
          <Link to="/panier" className="icon-btn" aria-label="Panier">
            <CartIcon />
            {cart.summary.itemCount > 0 && <span className="cart-count">{cart.summary.itemCount}</span>}
          </Link>
          <Link to={user ? '/compte' : '/connexion'} className="header-account">
            <UserIcon />
            <span className="header-account-name">{user ? user.username : 'Connexion'}</span>
          </Link>
        </div>
      </div>

      <div className="header-search-bar">
        <span className="search-scope-label">Produits</span>
        <form className="search-form" onSubmit={onSearch}>
          <input
            type="search"
            placeholder="Rechercher une carte, une extension..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="Rechercher">
            <SearchIcon />
          </button>
        </form>
      </div>
    </>
  );
}
