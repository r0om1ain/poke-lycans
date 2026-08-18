import { useEffect, useState } from 'react';
import { ordersApi } from '../../api/orders.js';
import { LoadingBlock } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { formatDate, formatPrice } from '../../lib/format.js';

const TABS = [
  { key: 'AWAITING_PAYMENT', label: 'En attente de paiement' },
  { key: 'PAID', label: 'Payée' },
  { key: 'SHIPPED', label: 'Envoyée' },
  { key: 'DELIVERED', label: 'Arrivée' },
];

function SaleCard({ order, onChanged }) {
  async function onShip() {
    await ordersApi.ship(order.id);
    onChanged();
  }

  return (
    <div className="order-card">
      <div className="order-card-header">
        <span>Acheteur : <strong>{order.counterpart.username}</strong></span>
        <span>{formatDate(order.createdAt)}</span>
      </div>
      {order.items.map((item) => (
        <div className="order-item-row" key={item.id}>
          <span>{item.name} × {item.quantity}</span>
          <span>{formatPrice(Number(item.price) * item.quantity)}</span>
        </div>
      ))}
      {order.address && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Livraison à {order.address.recipient} — {order.address.line1}, {order.address.zip} {order.address.city}, {order.address.country}
        </p>
      )}
      <div className="order-card-footer">
        <span className="price" style={{ fontSize: '1.05rem' }}>{formatPrice(order.total)}</span>
        {order.status === 'PAID' && <button className="btn btn-primary btn-sm" onClick={onShip}>Marquer comme envoyée</button>}
      </div>
    </div>
  );
}

export function AccountSales() {
  const [tab, setTab] = useState('AWAITING_PAYMENT');
  const [orders, setOrders] = useState(null);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    ordersApi.sales().then((r) => setCounts(r.counts));
    ordersApi.sales(tab).then((r) => setOrders(r.orders)).finally(() => setLoading(false));
  }

  useEffect(load, [tab]);

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>Mes ventes</h2>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label} <span className="tab-count">({counts[t.key] ?? 0})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBlock />
      ) : orders?.length === 0 ? (
        <EmptyState title="Aucune vente dans cette catégorie" />
      ) : (
        orders?.map((order) => <SaleCard key={order.id} order={order} onChanged={load} />)
      )}
    </div>
  );
}
