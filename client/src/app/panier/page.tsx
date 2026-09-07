'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ordersApi } from '@/lib/api/orders';
import { uploadUrl, ApiError } from '@/lib/api/client';
import { ExemplarBadges } from '@/components/product/ExemplarBadges';
import { EmptyState } from '@/components/common/EmptyState';
import { formatPrice } from '@/lib/format';
import type { PanierVendeur } from '@/types';

// Plus de choix de mode de livraison (ShippingMethod supprimé du schéma) : la
// livraison réelle est saisie par le vendeur à l'expédition (datExpedition).
function SellerBlock({ block }: { block: PanierVendeur }) {
  const { updateQuantity, remove } = useCart();

  return (
    <div className="cart-seller-block">
      <div className="cart-seller-header">
        <Link href={`/vendeurs/${block.vendeur.id}`}>{block.vendeur.pseudo}</Link>
      </div>

      {block.lignes.map((item) => (
        <div className="cart-item-row" key={item.id}>
          <div className="list-row-thumb">
            {item.annonce.produit.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={uploadUrl(item.annonce.produit.image) ?? undefined} alt="" />
            )}
          </div>
          <div className="list-row-main">
            <div className="list-row-name">{item.annonce.produit.nom}</div>
            <ExemplarBadges item={item.annonce.caracteristiques} compact />
          </div>
          <input
            type="number"
            min="1"
            className="input cart-qty-input"
            value={item.quantite}
            onChange={(e) => updateQuantity(item.id, Math.max(1, Number(e.target.value)))}
          />
          <span className="price">{formatPrice(Number(item.prixUnitaire) * item.quantite)}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(item.id)}>
            Retirer
          </button>
        </div>
      ))}

      <div className="cart-seller-footer">
        <div className="cart-seller-footer-row" style={{ color: 'var(--text)', fontWeight: 700 }}>
          <span>Total vendeur</span>
          <span>{formatPrice(block.sousTotal)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { user } = useAuth();
  const { cart, loading, refresh } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState({
    adresse: user?.adresse ?? '',
    codePostal: user?.codePostal ?? '',
    ville: user?.ville ?? '',
    pays: user?.pays ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumb = (
    <nav className="breadcrumb">
      <Link href="/">Accueil</Link>
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
          action={<Link href="/connexion" className="btn btn-primary">Se connecter</Link>}
        />
      </div>
    );
  }

  if (!loading && cart.vendeurs.length === 0) {
    return (
      <div className="page">
        {breadcrumb}
        <EmptyState
          title="Ton panier est vide"
          description="Parcourez la marketplace pour trouver votre bonheur."
          action={<Link href="/recherche" className="btn btn-primary">Retour au marché</Link>}
        />
      </div>
    );
  }

  const addressComplete = address.adresse && address.codePostal && address.ville && address.pays;

  async function onCheckout() {
    setError(null);
    setSubmitting(true);
    try {
      await ordersApi.checkout(address);
      await refresh();
      router.push('/achats');
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

      {cart.vendeurs.map((block) => (
        <SellerBlock key={block.vendeur.id} block={block} />
      ))}

      <div className="cart-summary">
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Récapitulatif</h3>
        <div className="cart-seller-footer-row"><span>Vendeurs</span><span>{cart.summary.nombreVendeurs}</span></div>
        <div className="cart-seller-footer-row"><span>Articles</span><span>{cart.summary.nombreArticles}</span></div>
        <div className="cart-seller-footer-row" style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.05rem', marginTop: 8 }}>
          <span>Total général</span><span>{formatPrice(cart.summary.valeurTotale)}</span>
        </div>

        <div className="field" style={{ marginTop: 'var(--space-4)' }}>
          <label>Adresse de livraison</label>
          <input className="input" placeholder="Adresse" value={address.adresse} onChange={(e) => setAddress((a) => ({ ...a, adresse: e.target.value }))} />
          <input className="input" style={{ marginTop: 6 }} placeholder="Code postal" value={address.codePostal} onChange={(e) => setAddress((a) => ({ ...a, codePostal: e.target.value }))} />
          <input className="input" style={{ marginTop: 6 }} placeholder="Ville" value={address.ville} onChange={(e) => setAddress((a) => ({ ...a, ville: e.target.value }))} />
          <input className="input" style={{ marginTop: 6 }} placeholder="Pays" value={address.pays} onChange={(e) => setAddress((a) => ({ ...a, pays: e.target.value }))} />
        </div>

        {error && <p className="form-error">{error}</p>}
        <button type="button" className="btn btn-primary btn-block" disabled={submitting || !addressComplete} onClick={onCheckout}>
          {submitting ? 'Validation...' : 'Valider la commande'}
        </button>
      </div>
    </div>
  );
}
