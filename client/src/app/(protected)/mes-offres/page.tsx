'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { listingsApi } from '@/lib/api/listings';
import { catalogApi } from '@/lib/api/catalog';
import { uploadUrl } from '@/lib/api/client';
import { ExemplarBadges } from '@/components/product/ExemplarBadges';
import { SeriesLabel } from '@/components/product/SeriesLabel';
import { LoadingBlock } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { productUrl } from '@/lib/productUrl';
import type { Annonce, FacetCategorie, Serie } from '@/types';

const SORTS = [
  { key: 'recent', label: 'Plus récent' },
  { key: 'price-asc', label: 'Moins chères d’abord' },
  { key: 'price-desc', label: 'Plus chères d’abord' },
  { key: 'name-asc', label: 'Nom (A-Z)' },
  { key: 'name-desc', label: 'Nom (Z-A)' },
];

function sortItems(items: Annonce[], sort: string): Annonce[] {
  const copy = [...items];
  if (sort === 'name-asc') copy.sort((a, b) => a.produit.nom.localeCompare(b.produit.nom));
  if (sort === 'name-desc') copy.sort((a, b) => b.produit.nom.localeCompare(a.produit.nom));
  if (sort === 'price-asc') copy.sort((a, b) => Number(a.prix) - Number(b.prix));
  if (sort === 'price-desc') copy.sort((a, b) => Number(b.prix) - Number(a.prix));
  return copy;
}

function StockRow({
  listing,
  index,
  onUpdated,
  onRemove,
}: {
  listing: Annonce;
  index: number;
  onUpdated: (l: Annonce) => void;
  onRemove: (id: number) => void;
}) {
  const [qty, setQty] = useState(listing.quantite);
  const [price, setPrice] = useState(listing.prix);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setQty(listing.quantite);
    setPrice(listing.prix);
  }, [listing.quantite, listing.prix]);

  async function commit(field: 'quantite' | 'prix', raw: string) {
    const num = Number(raw);
    const current = field === 'quantite' ? listing.quantite : listing.prix;
    if (!raw || Number.isNaN(num) || num <= 0) {
      setQty(listing.quantite);
      setPrice(listing.prix);
      return;
    }
    if (num === Number(current)) return;
    setSaving(true);
    try {
      const updated = await listingsApi.update(listing.id, { [field]: num });
      onUpdated(updated);
    } catch {
      setQty(listing.quantite);
      setPrice(listing.prix);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="stock-row">
      <td className="stock-row__num">{index + 1}</td>
      <td className="stock-row__name">
        <div className="stock-row__thumb">
          {listing.produit.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={uploadUrl(listing.produit.image) ?? undefined} alt="" />
          )}
        </div>
        <div className="stock-row__name-body">
          <Link href={productUrl(listing.produit)} className="stock-row__name-link">
            {listing.produit.nom}
            {listing.produit.serie?.code && listing.produit.numero && (
              <span className="stock-row__code"> ({listing.produit.serie.code} {listing.produit.numero})</span>
            )}
          </Link>
          <SeriesLabel series={listing.produit.serie} />
        </div>
      </td>
      <td className="stock-row__info">
        <ExemplarBadges item={listing.caracteristiques} compact />
        {listing.description && <div className="stock-row__comment">{listing.description}</div>}
      </td>
      <td className="stock-row__offer">
        <input
          type="number"
          min="1"
          className="input input-xs"
          value={qty}
          disabled={saving}
          onChange={(e) => setQty(Number(e.target.value))}
          onBlur={(e) => commit('quantite', e.target.value)}
          aria-label="Quantité disponible"
        />
        <div className="stock-row__price">
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="input input-xs"
            value={price}
            disabled={saving}
            onChange={(e) => setPrice(Number(e.target.value))}
            onBlur={(e) => commit('prix', e.target.value)}
            aria-label="Prix"
          />
          <span>€</span>
        </div>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => onRemove(listing.id)}>
          Retirer
        </button>
      </td>
    </tr>
  );
}

// "Catégorie" remplacé par type (carte | type d'item) — plus de Product unifié.
// NB : ListingController.Mine n'accepte que idTypeItem/idSerie côté backend
// (pas de nom ni de pagination) — le filtre par nom et le tri se font ici en
// mémoire, sur la liste déjà chargée.
export default function MyListingsPage() {
  const [facets, setFacets] = useState<FacetCategorie[] | null>(null);
  const [tabKey, setTabKey] = useState<string>(''); // '' = tout, 'carte' = cartes, sinon id de typeItem
  const [idSerie, setIdSerie] = useState('');
  const [name, setName] = useState('');
  const [sort, setSort] = useState('recent');
  const [items, setItems] = useState<Annonce[] | null>(null);
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);

  const idTypeItem = tabKey && tabKey !== 'carte' ? Number(tabKey) : undefined;

  useEffect(() => {
    listingsApi.myFacets().then(setFacets).catch(() => {});
    catalogApi.series().then(setSeries).catch(() => {});
  }, []);

  useEffect(() => {
    setIdSerie('');
  }, [tabKey]);

  useEffect(() => {
    setLoading(true);
    listingsApi
      .mine({ idTypeItem, idSerie: idSerie ? Number(idSerie) : undefined })
      .then((all) => setItems(tabKey === 'carte' ? all.filter((a) => a.produit.type === 'carte') : all))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tabKey, idSerie, idTypeItem]);

  const filtered = useMemo(() => {
    const byName = name ? (items ?? []).filter((a) => a.produit.nom.toLowerCase().includes(name.toLowerCase())) : items ?? [];
    return sortItems(byName, sort);
  }, [items, name, sort]);

  const cardFacet = facets?.find((f) => f.idTypeItem === null);
  const itemFacets = facets?.filter((f) => f.idTypeItem !== null) ?? [];
  const activeTabName = tabKey === 'carte' ? 'Cartes' : tabKey ? itemFacets.find((t) => String(t.idTypeItem) === tabKey)?.nom : null;

  function onUpdated(updated: Annonce) {
    setItems((r) => (r ? r.map((i) => (i.id === updated.id ? updated : i)) : r));
  }

  async function onRemove(id: number) {
    await listingsApi.remove(id);
    setItems((r) => (r ? r.filter((i) => i.id !== id) : r));
    listingsApi.myFacets().then(setFacets).catch(() => {});
  }

  return (
    <div className="catalog-page">
      <div className="container catalog-main">
        <nav className="breadcrumb">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <span>Stock</span>
          <span>/</span>
          {tabKey ? <Link href="/mes-offres" onClick={() => setTabKey('')}>Mes offres</Link> : <span>Mes offres</span>}
          {activeTabName && (
            <>
              <span>/</span>
              <span>{activeTabName}</span>
            </>
          )}
        </nav>

        <div className="catalog-heading">
          <div>
            <h1>Mes offres</h1>
            <p>Vos annonces actuellement en vente sur la marketplace — quantité et prix modifiables directement dans la liste.</p>
          </div>
        </div>

        {facets && ((cardFacet?.total ?? 0) > 0 || itemFacets.length > 0) && (
          <div className="tabs">
            <button className={`tab ${!tabKey ? 'active' : ''}`} onClick={() => setTabKey('')}>Tout</button>
            {(cardFacet?.total ?? 0) > 0 && (
              <button className={`tab ${tabKey === 'carte' ? 'active' : ''}`} onClick={() => setTabKey('carte')}>
                Cartes <span className="tab-count">({cardFacet?.total})</span>
              </button>
            )}
            {itemFacets.map((t) => (
              <button key={t.idTypeItem} className={`tab ${tabKey === String(t.idTypeItem) ? 'active' : ''}`} onClick={() => setTabKey(String(t.idTypeItem))}>
                {t.nom} <span className="tab-count">({t.total})</span>
              </button>
            ))}
          </div>
        )}

        <section className="catalog-toolbar" style={{ gridTemplateColumns: '230px 1fr auto' }}>
          <label className="catalog-select">
            <span>Édition</span>
            <select className="select" value={idSerie} onChange={(e) => setIdSerie(e.target.value)}>
              <option value="">Toutes</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
          <label className="catalog-search">
            <span>Nom</span>
            <input className="input" type="search" placeholder="Filtrer par nom" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="catalog-select">
            <span>Trier par</span>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="catalog-results">
          {loading ? (
            <LoadingBlock />
          ) : (
            <>
              <div className="results-bar">
                <div className="results-bar-info">
                  <strong>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</strong>
                </div>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  title="Aucune offre pour ces critères"
                  description="Trouvez un produit dans le catalogue puis « Mettre en vente » depuis sa fiche."
                  action={<Link href="/recherche" className="btn btn-primary">Explorer le catalogue</Link>}
                />
              ) : (
                <div className="stock-table-wrap">
                  <table className="stock-table">
                    <thead>
                      <tr>
                        <th className="stock-row__num">#</th>
                        <th>Nom</th>
                        <th>Info.</th>
                        <th>Offre</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((listing, i) => (
                        <StockRow key={listing.id} listing={listing} index={i} onUpdated={onUpdated} onRemove={onRemove} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
