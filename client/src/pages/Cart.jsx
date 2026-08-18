import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { accountApi } from '../api/account.js';
import { ordersApi } from '../api/orders.js';
import { uploadUrl, ApiError } from '../api/client.js';
import { ExemplarBadges } from '../components/product/ExemplarBadges.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { formatPrice } from '../lib/format.js';

function SellerBlock({ block, shippingChoice, onShippingChange }) {
  const { updateQuantity, remove } = useCart();
  const method = block.shippingMethods.find((m) => m.id === shippingChoice);
  const shippingCost = method ? Number(method.price) : 0;

  return (
    <div className="cart-seller-block">
      <div className="cart-seller-header">
        <Link to={`/vendeurs/${block.seller.id}`}>{block.seller.username}</Link>
      </div>

      {block.items.map((item) => (
        <div className="cart-item-row" key={item.id}>
          <div className="list-row-thumb">
            {item.listing.product.imageUrl && <img src={uploadUrl(item.listing.product.imageUrl)} alt="" />}
          </div>
          <div className="list-row-main">
            <div className="list-row-name">{item.listing.product.name}</div>
            <ExemplarBadges item={item.listing} compact />
          </div>
          <input
            type="number"
            min="1"
            className="input cart-qty-input"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, Math.max(1, Number(e.target.value)))}
          />
          <span className="price">{formatPrice(Number(item.listing.price) * item.quantity)}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(item.id)}>
            Retirer
          </button>
        </div>
      ))}

      <div className="cart-seller-footer">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Mode de livraison</label>
          <select className="select" value={shippingChoice ?? ''} onChange={(e) => onShippingChange(e.target.value)}>
            <option value="">Sans livraison</option>
            {block.shippingMethods.map((m) => (
              <option key={m.id} value={m.id}>{m.name} — {formatPrice(m.price)}</option>
            ))}
          </select>
        </div>
        <div className="cart-seller-footer-row">
          <span>Sous-total</span>
          <span>{formatPrice(block.subtotal)}</span>
        </div>
        <div className="cart-seller-footer-row">
          <span>Livraison</span>
          <span>{formatPrice(shippingCost)}</span>
        </div>
        <div className="cart-seller-footer-row" style={{ color: 'var(--text)', fontWeight: 700 }}>
          <span>Total vendeur</span>
          <span>{formatPrice(block.subtotal + shippingCost)}</span>
        </div>
      </div>
    </div>
  );
}

export function Cart() {
  const { user } = useAuth();
  const { cart, loading, refresh } = useCart();
  const navigate = useNavigate();

  const [shippingBySeller, setShippingBySeller] = useState({});
  const [addressId, setAddressId] = useState('');
  const [addresses, setAddresses] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) accountApi.listAddresses().then((r) => setAddresses(r.addresses));
  }, [user]);

  const breadcrumb = (
    <nav className="breadcrumb">
      <Link to="/">Accueil</Link>
      <span>/</span>
      <span>Panier</span>
    </nav>
  );

  if (!user) {
    return (
      <div className="page">
        {breadcrumb}
        <EmptyState
          title="Connectez-vous pour voir votre panier"
          action={<Link to="/connexion" className="btn btn-primary">Se connecter</Link>}
        />
      </div>
    );
  }

  if (!loading && cart.sellers.length === 0) {
    return (
      <div className="page">
        {breadcrumb}
        <EmptyState
          title="Ton panier est vide"
          description="Parcourez la marketplace pour trouver votre bonheur."
          action={<Link to="/recherche" className="btn btn-primary">Retour au marché</Link>}
        />
      </div>
    );
  }

  const totalShipping = cart.sellers.reduce((sum, block) => {
    const method = block.shippingMethods.find((m) => m.id === shippingBySeller[block.seller.id]);
    return sum + (method ? Number(method.price) : 0);
  }, 0);
  const grandTotal = cart.summary.totalValue + totalShipping;

  async function onCheckout() {
    setError(null);
    setSubmitting(true);
    try {
      await ordersApi.checkout({ addressId, shippingMethodBySeller: shippingBySeller });
      await refresh();
      navigate('/achats');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de valider la commande');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      {breadcrumb}
      <h1 className="page-title">Panier</h1>

      {cart.sellers.map((block) => (
        <SellerBlock
          key={block.seller.id}
          block={block}
          shippingChoice={shippingBySeller[block.seller.id]}
          onShippingChange={(v) => setShippingBySeller((s) => ({ ...s, [block.seller.id]: v || undefined }))}
        />
      ))}

      <div className="cart-summary">
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Récapitulatif</h3>
        <div className="cart-seller-footer-row"><span>Vendeurs</span><span>{cart.summary.sellerCount}</span></div>
        <div className="cart-seller-footer-row"><span>Articles</span><span>{cart.summary.itemCount}</span></div>
        <div className="cart-seller-footer-row"><span>Livraison</span><span>{formatPrice(totalShipping)}</span></div>
        <div className="cart-seller-footer-row" style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.05rem', marginTop: 8 }}>
          <span>Total général</span><span>{formatPrice(grandTotal)}</span>
        </div>

        <div className="field" style={{ marginTop: 'var(--space-4)' }}>
          <label>Adresse de livraison</label>
          {addresses?.length ? (
            <select className="select" value={addressId} onChange={(e) => setAddressId(e.target.value)}>
              <option value="">Sélectionner une adresse</option>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>{a.label} — {a.city}</option>
              ))}
            </select>
          ) : (
            <Link to="/compte/adresses" className="btn btn-secondary btn-sm">Ajouter une adresse</Link>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}
        <button type="button" className="btn btn-primary btn-block" disabled={submitting || !addressId} onClick={onCheckout}>
          {submitting ? 'Validation...' : 'Valider la commande'}
        </button>
      </div>
    </div>
  );
}
