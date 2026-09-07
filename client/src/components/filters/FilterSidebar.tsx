'use client';

import { useEffect, useState } from 'react';
import { catalogApi } from '@/lib/api/catalog';
import { STATE_LABELS, STATE_ORDER } from '@/lib/format';
import { FilterSelect } from '../common/FilterSelect';
import type { ExemplarFilters, Langue, SocieteGradation } from '@/types';

const CHARACTERISTICS = [
  { key: 'holo', label: 'Holo' },
  { key: 'edition1', label: '1re édition' },
  { key: 'pokeball', label: 'Poké Ball' },
  { key: 'misscut', label: 'Miscut' },
  { key: 'missprint', label: 'Missprint' },
  { key: 'stamp', label: 'Stamp' },
  { key: 'reverse', label: 'Reverse' },
];

const TRISTATE_OPTIONS = [
  { value: '', label: 'Indifférent' },
  { value: 'true', label: 'Oui' },
  { value: 'false', label: 'Non' },
];

const IGNORED_KEYS = new Set(['type', 'idTypeItem', 'idSerie', 'idBloc', 'q']);

// Système de filtres UNIQUE, réutilisé partout (Marketplace, Mes offres,
// Enchères, offres d'une fiche produit). NB : pas de filtre "rareté" — le
// backend n'expose plus de paramètre de recherche par rareté (seul le lookup
// GET /api/catalog/raretes existe encore, sans filtre associé côté search).
export function FilterSidebar({
  filters,
  onChange,
  showAvailability = false,
  showPrice = true,
  title = 'Filtres',
  className = '',
}: {
  filters: ExemplarFilters;
  onChange: (filters: ExemplarFilters) => void;
  showAvailability?: boolean;
  showPrice?: boolean;
  title?: string;
  className?: string;
}) {
  const [langues, setLangues] = useState<Langue[]>([]);
  const [societes, setSocietes] = useState<SocieteGradation[]>([]);
  const [priceRange, setPriceRange] = useState({ min: filters.minPrice?.toString() ?? '', max: filters.maxPrice?.toString() ?? '' });

  useEffect(() => {
    catalogApi.langues().then(setLangues).catch(() => {});
    catalogApi.societesGradation().then(setSocietes).catch(() => {});
  }, []);

  function set(key: string, value: unknown) {
    onChange({ ...filters, [key]: value } as ExemplarFilters);
  }

  function triStateValue(key: string): string {
    const v = (filters as Record<string, unknown>)[key];
    if (v === true) return 'true';
    if (v === false) return 'false';
    return '';
  }
  function setTriState(key: string, raw: string) {
    if (raw === 'true') set(key, true);
    else if (raw === 'false') set(key, false);
    else set(key, undefined);
  }

  function applyPriceRange() {
    onChange({ ...filters, minPrice: priceRange.min || undefined, maxPrice: priceRange.max || undefined });
  }

  function reset() {
    const kept: Record<string, unknown> = {};
    for (const key of Object.keys(filters)) {
      if (IGNORED_KEYS.has(key)) kept[key] = (filters as Record<string, unknown>)[key];
    }
    onChange(kept as ExemplarFilters);
    setPriceRange({ min: '', max: '' });
  }

  const activeCount = Object.keys(filters).filter((k) => !IGNORED_KEYS.has(k)).length;

  return (
    <aside className={`filters-panel ${className}`}>
      <div className="filters-panel__title">
        <h2>{title}</h2>
        {activeCount > 0 && <button type="button" onClick={reset}>Rétablir</button>}
      </div>

      {showAvailability && (
        <div className="filter-group">
          <h3>Disponibilité</h3>
          <label>
            <input type="checkbox" checked={Boolean(filters.availableOnly)} onChange={(e) => set('availableOnly', e.target.checked || undefined)} />
            Articles disponibles
          </label>
        </div>
      )}

      {showPrice && (
        <div className="filter-group">
          <h3>Prix</h3>
          <div className="price-inputs">
            <input type="number" min="0" placeholder="Min" className="input" value={priceRange.min}
              onChange={(e) => setPriceRange((r) => ({ ...r, min: e.target.value }))} onBlur={applyPriceRange} />
            <span>—</span>
            <input type="number" min="0" placeholder="Max" className="input" value={priceRange.max}
              onChange={(e) => setPriceRange((r) => ({ ...r, max: e.target.value }))} onBlur={applyPriceRange} />
          </div>
        </div>
      )}

      <div className="filters">
        <FilterSelect
          icon="☻"
          label="Condition min."
          value={filters.etatMin ?? ''}
          onChange={(v) => set('etatMin', v || undefined)}
          options={[{ value: '', label: 'Indifférent' }, ...STATE_ORDER.map((k) => ({ value: k, label: STATE_LABELS[k] }))]}
        />

        <FilterSelect
          icon="Aあ"
          label="Langue"
          value={String(filters.idLangue ?? '')}
          onChange={(v) => set('idLangue', v ? Number(v) : undefined)}
          options={[{ value: '', label: 'Toutes les langues' }, ...langues.map((l) => ({ value: String(l.id), label: l.nom }))]}
        />
      </div>

      <div className="filter-group">
        <h3>Caractéristiques</h3>
        <div className="filters">
          {CHARACTERISTICS.map(({ key, label }) => (
            <FilterSelect
              key={key}
              label={label}
              value={triStateValue(key)}
              onChange={(v) => setTriState(key, v)}
              options={TRISTATE_OPTIONS}
            />
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>Gradation</h3>
        <div className="filters">
          <FilterSelect
            label="Gradée"
            value={filters.grade ? 'true' : ''}
            onChange={(v) => {
              if (v === 'true') set('grade', true);
              else onChange({ ...filters, grade: undefined, idSocieteGradation: undefined });
            }}
            options={[{ value: '', label: 'Indifférent' }, { value: 'true', label: 'Oui' }]}
          />
          {filters.grade && (
            <FilterSelect
              label="Société"
              value={String(filters.idSocieteGradation ?? '')}
              onChange={(v) => set('idSocieteGradation', v ? Number(v) : undefined)}
              options={[{ value: '', label: 'Toutes les sociétés' }, ...societes.map((g) => ({ value: String(g.id), label: g.nom }))]}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
