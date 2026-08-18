import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { CartIcon, MessageIcon, UserIcon } from '../common/Icons.jsx';

function SearchInput({ className }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    navigate(`/recherche${value ? `?nom=${encodeURIComponent(value)}` : ''}`);
  }

  return (
    <form className={className} onSubmit={onSubmit}>
      <input
        type="search"
        placeholder="Rechercher une carte, une extension..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}

export function Header() {
  const { user } = useAuth();
  const { cart } = useCart();

  return (
    <>
      <header className="header">
        <Link to="/" className="brand">
          TCG<span>World</span>
        </Link>

        <SearchInput className="header-search" />

        <nav className="header-nav">
          <NavLink to="/" end>Accueil</NavLink>
          <NavLink to="/recherche">Marketplace</NavLink>
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
          <Link to={user ? '/compte' : '/connexion'} className="icon-btn" aria-label="Compte">
            <UserIcon />
          </Link>
        </div>
      </header>
      <SearchInput className="mobile-search" />
    </>
  );
}
