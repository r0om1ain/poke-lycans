import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders.js';
import { useCart } from '../../context/CartContext.jsx';
import { LoadingBlock } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ApiError } from '../../api/client.js';
import { formatDate, formatPrice } from '../../lib/format.js';

const TABS = [
  { key: 'CART', label: 'Dans le panier' },
  { key: 'AWAITING_PAYMENT', label: 'À payer' },
  { key: 'PAID', label: 'Payée' },
  { key: 'SHIPPED', label: 'Envoyée' },
  { key: 'DELIVERED', label: 'Arrivée' },
];

function ReviewForm({ orderId, onDone }) {
  const [rating, setRating] = useState('POSITIVE');
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await ordersApi.review(orderId, { rating, comment: comment || undefined });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Évaluation impossible');
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
      <select className="select" value={rating} onChange={(e) => setRating(e.target.value)}>
        <option value="POSITIVE">Positive</option>
        <option value="NEUTRAL">Neutre</option>
        <option value="NEGATIVE">Négative</option>
      </select>
      <input className="input" placeholder="Commentaire (facultatif)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <button type="submit" className="btn btn-primary btn-sm">Évaluer le vendeur</button>
      {error && <span className="form-error">{error}</span>}
    </form>
  );
}

function OrderCard({ order, onChanged }) {
  const [reviewing, setReviewing] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  async function onPay() {
    await ordersApi.pay(order.id, {});
    onChanged();
  }
  async function onReceive() {
    await ordersApi.receive(order.id);
    onChanged();
  }

  return (
    <div className="order-card">
      <div className="order-card-header">
        <span>Vendu par <strong>{order.counterpart.username}</strong></span>
        <span>{formatDate(order.createdAt)}</span>
      </div>
      {order.items.map((item) => (
        <div className="order-item-row" key={item.id}>
          <span>{item.name} × {item.quantity}</span>
          <span>{formatPrice(Number(item.price) * item.quantity)}</span>
        </div>
      ))}
      <div className="order-card-footer">
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Livraison {order.shippingMethodName ?? '—'} · {formatPrice(order.shippingCost)}
          </div>
          <span className="price" style={{ fontSize: '1.05rem' }}>{formatPrice(order.total)}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {order.status === 'AWAITING_PAYMENT' && (
            <button className="btn btn-primary btn-sm" onClick={onPay}>Payer</button>
          )}
          {order.status === 'SHIPPED' && (
            <button className="btn btn-primary btn-sm" onClick={onReceive}>Marquer comme reçue</button>
          )}
          {order.status === 'DELIVERED' && !reviewed && (
            <button className="btn btn-secondary btn-sm" onClick={() => setReviewing((r) => !r)}>Évaluer</button>
          )}
        </div>
      </div>
      {reviewing && <div style={{ marginTop: 'var(--space-3)' }}><ReviewForm orderId={order.id} onDone={() => { setReviewing(false); setReviewed(true); }} /></div>}
    </div>
  );
}

// Page indépendante (pas nichée dans "Mon compte"), comme les pages
// Commandes du gabarit fourni (fil d'ariane "Accueil / Commandes / Mes achats").
export function Purchases() {
  const { cart } = useCart();
  const [tab, setTab] = useState('AWAITING_PAYMENT');
  const [orders, setOrders] = useState(null);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    ordersApi.purchases().then((r) => {
      setCounts(r.counts);
    });
    if (tab !== 'CART') {
      ordersApi.purchases(tab).then((r) => setOrders(r.orders)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }

  useEffect(load, [tab]);

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link>
        <span>/</span>
        <span>Commandes</span>
        <span>/</span>
        <span>Mes achats</span>
      </nav>
      <h1 className="page-title">Mes achats</h1>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label} <span className="tab-count">({t.key === 'CART' ? cart.summary.itemCount : counts[t.key] ?? 0})</span>
          </button>
        ))}
      </div>

      {tab === 'CART' ? (
        cart.summary.itemCount === 0 ? (
          <EmptyState title="Panier vide" action={<Link to="/recherche" className="btn btn-primary">Explorer</Link>} />
        ) : (
          <EmptyState title={`${cart.summary.itemCount} article(s) dans le panier`} action={<Link to="/panier" className="btn btn-primary">Voir le panier</Link>} />
        )
      ) : loading ? (
        <LoadingBlock />
      ) : orders?.length === 0 ? (
        <EmptyState title="Aucune commande dans cette catégorie" />
      ) : (
        orders?.map((order) => <OrderCard key={order.id} order={order} onChanged={load} />)
      )}
    </div>
  );
}
