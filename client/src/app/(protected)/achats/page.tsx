'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersApi } from '@/lib/api/orders';
import { useCart } from '@/context/CartContext';
import { LoadingBlock } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ApiError } from '@/lib/api/client';
import { formatDate, formatPrice } from '@/lib/format';
import type { Commande } from '@/types';

// Statuts = datStatutCommande.StcCode seedés côté backend.
const TABS = [
  { key: 'CART', label: 'Dans le panier' },
  { key: 'CREEE', label: 'À payer' },
  { key: 'PAYEE', label: 'Payée' },
  { key: 'EXPEDIEE', label: 'Envoyée' },
  { key: 'RECUE', label: 'Arrivée' },
];

// datEvaluation.EvaNote : note 1-5 (remplace l'ancien Positive/Neutre/Négative).
function ReviewForm({ orderId, onDone }: { orderId: number; onDone: () => void }) {
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await ordersApi.review(orderId, { note, commentaire: commentaire || undefined });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Évaluation impossible');
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
      <div role="radiogroup" aria-label="Note" style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNote(n)}
            aria-pressed={note >= n}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: note >= n ? 'var(--warning)' : 'var(--text-muted)' }}
          >
            ★
          </button>
        ))}
      </div>
      <input className="input" placeholder="Commentaire (facultatif)" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
      <button type="submit" className="btn btn-primary btn-sm">Évaluer le vendeur</button>
      {error && <span className="form-error">{error}</span>}
    </form>
  );
}

function OrderCard({ order, onChanged }: { order: Commande; onChanged: () => void }) {
  const [reviewing, setReviewing] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  async function onPay() {
    await ordersApi.pay(order.id);
    onChanged();
  }
  async function onReceive() {
    await ordersApi.receive(order.id);
    onChanged();
  }

  return (
    <div className="order-card">
      <div className="order-card-header">
        <span>Vendu par <strong>{order.vendeur.pseudo}</strong></span>
        <span>{formatDate(order.dateCreation)}</span>
      </div>
      {order.lignes.map((item) => (
        <div className="order-item-row" key={item.id}>
          <span>{item.produit.nom} × {item.quantite}</span>
          <span>{formatPrice(item.montantTotal)}</span>
        </div>
      ))}
      <div className="order-card-footer">
        <div>
          {order.expedition?.numeroSuivi && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Suivi {order.expedition.transporteur ?? ''} : {order.expedition.numeroSuivi}
            </div>
          )}
          <span className="price" style={{ fontSize: '1.05rem' }}>{formatPrice(order.montantTotal)}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {order.statut === 'CREEE' && (
            <button className="btn btn-primary btn-sm" onClick={onPay}>Payer</button>
          )}
          {order.statut === 'EXPEDIEE' && (
            <button className="btn btn-primary btn-sm" onClick={onReceive}>Marquer comme reçue</button>
          )}
          {order.statut === 'RECUE' && !reviewed && (
            <button className="btn btn-secondary btn-sm" onClick={() => setReviewing((r) => !r)}>Évaluer</button>
          )}
        </div>
      </div>
      {reviewing && <div style={{ marginTop: 'var(--space-3)' }}><ReviewForm orderId={order.id} onDone={() => { setReviewing(false); setReviewed(true); }} /></div>}
    </div>
  );
}

export default function PurchasesPage() {
  const { cart } = useCart();
  const [tab, setTab] = useState('CREEE');
  const [orders, setOrders] = useState<Commande[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    ordersApi
      .purchases()
      .then((all) => {
        const c: Record<string, number> = {};
        for (const o of all) c[o.statut] = (c[o.statut] ?? 0) + 1;
        setCounts(c);
      })
      .catch(() => {});
    if (tab !== 'CART') {
      ordersApi
        .purchases(tab)
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }

  useEffect(load, [tab]);

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <span>Commandes</span>
        <span>/</span>
        <span>Mes achats</span>
      </nav>
      <h1 className="page-title">Mes achats</h1>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label} <span className="tab-count">({t.key === 'CART' ? cart.summary.nombreArticles : counts[t.key] ?? 0})</span>
          </button>
        ))}
      </div>

      {tab === 'CART' ? (
        cart.summary.nombreArticles === 0 ? (
          <EmptyState title="Panier vide" action={<Link href="/recherche" className="btn btn-primary">Explorer</Link>} />
        ) : (
          <EmptyState title={`${cart.summary.nombreArticles} article(s) dans le panier`} action={<Link href="/panier" className="btn btn-primary">Voir le panier</Link>} />
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
