import { useEffect, useState } from 'react';
import { catalogApi } from '../../api/catalog.js';
import { STATE_LABELS, STATE_ORDER } from '../../lib/format.js';
import { FilterSelect } from '../common/FilterSelect.jsx';

const CHARACTERISTICS = [
  { key: 'holo', label: 'Holo' },
  { key: 'firstEdition', label: '1re édition' },
  { key: 'pokeball', label: 'Poké Ball' },
  { key: 'miscutMisprint', label: 'Miscut/Misprint' },
  { key: 'stamp', label: 'Stamp' },
  { key: 'reverse', label: 'Reverse' },
];

const TRISTATE_OPTIONS = [
  { value: '', label: 'Indifférent' },
  { value: 'true', label: 'Oui' },
  { value: 'false', label: 'Non' },
];

const IGNORED_KEYS = new Set(['categoryId', 'seriesId', 'name', 'exact']);

// Système de filtres UNIQUE, réutilisé partout (Marketplace, Mes offres,
// Enchères, offres d'une fiche produit) : une colonne compacte de
// sélecteurs custom (bouton label/valeur + menu déroulant), gabarit fourni
// par l'utilisateur — plus de <select> natifs ni de longues listes de cases
// à cocher.
export function FilterSidebar({
  filters,
  onChange,
  showAvailability = false,
  showPrice = true,
  title = 'Filtres',
  className = '',
}) {
  const [languages, setLanguages] = useState([]);
  const [gradingCompanies, setGradingCompanies] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: filters.minPrice ?? '', max: filters.maxPrice ?? '' });

  useEffect(() => {
    catalogApi.languages().then((r) => setLanguages(r.languages));
    catalogApi.gradingCompanies().then((r) => setGradingCompanies(r.gradingCompanies));
    catalogApi.rarities().then((r) => setRarities(r.rarities));
  }, []);

  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  // Tri-état Indifférent/Oui/Non (comme sur Cardmarket) : contrairement à
  // une simple case à cocher, "Non" doit pouvoir exclure explicitement les
  // exemplaires ayant la caractéristique, pas seulement ne pas filtrer.
  function triStateValue(key) {
    if (filters[key] === true) return 'true';
    if (filters[key] === false) return 'false';
    return '';
  }
  function setTriState(key, raw) {
    if (raw === 'true') set(key, true);
    else if (raw === 'false') set(key, false);
    else set(key, undefined);
  }

  function applyPriceRange() {
    onChange({ ...filters, minPrice: priceRange.min || undefined, maxPrice: priceRange.max || undefined });
  }

  function reset() {
    const kept = {};
    for (const key of Object.keys(filters)) {
      if (IGNORED_KEYS.has(key)) kept[key] = filters[key];
    }
    onChange(kept);
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
          value={filters.state ?? ''}
          onChange={(v) => set('state', v || undefined)}
          options={[{ value: '', label: 'Indifférent' }, ...STATE_ORDER.map((k) => ({ value: k, label: STATE_LABELS[k] }))]}
        />

        <FilterSelect
          icon="Aあ"
          label="Langue"
          value={filters.languageId ?? ''}
          onChange={(v) => set('languageId', v || undefined)}
          options={[{ value: '', label: 'Toutes les langues' }, ...languages.map((l) => ({ value: l.id, label: l.name }))]}
        />

        {rarities.length > 0 && (
          <FilterSelect
            icon="★"
            label="Rareté"
            value={filters.rarity ?? ''}
            onChange={(v) => set('rarity', v || undefined)}
            options={[{ value: '', label: 'Toutes' }, ...rarities.map((r) => ({ value: r, label: r }))]}
          />
        )}
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
            value={filters.graded ? 'true' : ''}
            onChange={(v) => {
              if (v === 'true') set('graded', true);
              else onChange({ ...filters, graded: undefined, gradingCompanyId: undefined });
            }}
            options={[{ value: '', label: 'Indifférent' }, { value: 'true', label: 'Oui' }]}
          />
          {filters.graded && (
            <FilterSelect
              label="Société"
              value={filters.gradingCompanyId ?? ''}
              onChange={(v) => set('gradingCompanyId', v || undefined)}
              options={[{ value: '', label: 'Toutes les sociétés' }, ...gradingCompanies.map((g) => ({ value: g.id, label: g.name }))]}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
