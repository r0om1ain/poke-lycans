'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersApi } from '@/lib/api/orders';
import { LoadingBlock } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatPrice } from '@/lib/format';
import type { Commande } from '@/types';

const TABS = [
  { key: 'CREEE', label: 'En attente de paiement' },
  { key: 'PAYEE', label: 'Payée' },
  { key: 'EXPEDIEE', label: 'Envoyée' },
  { key: 'RECUE', label: 'Arrivée' },
];

function SaleCard({ order, onChanged }: { order: Commande; onChanged: () => void }) {
  async function onShip() {
    await ordersApi.ship(order.id, {});
    onChanged();
  }

  return (
    <div className="order-card">
      <div className="order-card-header">
        <span>Acheteur : <strong>{order.acheteur.pseudo}</strong></span>
        <span>{formatDate(order.dateCreation)}</span>
      </div>
      {order.lignes.map((item) => (
        <div className="order-item-row" key={item.id}>
          <span>{item.produit.nom} × {item.quantite}</span>
          <span>{formatPrice(item.montantTotal)}</span>
        </div>
      ))}
      {order.adresse && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Livraison : {order.adresse}, {order.codePostal} {order.ville}, {order.pays}
        </p>
      )}
      <div className="order-card-footer">
        <span className="price" style={{ fontSize: '1.05rem' }}>{formatPrice(order.montantTotal)}</span>
        {order.statut === 'PAYEE' && <button className="btn btn-primary btn-sm" onClick={onShip}>Marquer comme envoyée</button>}
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [tab, setTab] = useState('CREEE');
  const [orders, setOrders] = useState<Commande[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    ordersApi
      .sales()
      .then((all) => {
        const c: Record<string, number> = {};
        for (const o of all) c[o.statut] = (c[o.statut] ?? 0) + 1;
        setCounts(c);
      })
      .catch(() => {});
    ordersApi
      .sales(tab)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }

  useEffect(load, [tab]);

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <span>Commandes</span>
        <span>/</span>
        <span>Mes ventes</span>
      </nav>
      <h1 className="page-title">Mes ventes</h1>

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
