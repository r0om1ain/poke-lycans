import { useEffect, useState } from 'react';
import { catalogApi } from '../../api/catalog.js';
import { STATE_LABELS } from '../../lib/format.js';

const STATES = Object.keys(STATE_LABELS);

const CHARACTERISTICS = [
  { key: 'holo', label: 'Holo' },
  { key: 'firstEdition', label: '1re édition' },
  { key: 'pokeball', label: 'Poké Ball' },
  { key: 'miscutMisprint', label: 'Miscut/Misprint' },
  { key: 'stamp', label: 'Stamp' },
  { key: 'reverse', label: 'Reverse' },
];

// Barre de filtres horizontale façon Cardmarket (specs §12 recherche / §39
// enchères) : catégorie, série, nom toujours visibles ; caractéristiques
// repliées sous "Plus d'options".
export function FilterPanel({ filters, onChange, nameValue, onNameChange, showCategory = true, title = 'Cartes' }) {
  const [lookups, setLookups] = useState({ categories: [], series: [], languages: [], gradingCompanies: [] });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Promise.all([
      catalogApi.categories(),
      catalogApi.series(),
      catalogApi.languages(),
      catalogApi.gradingCompanies(),
    ]).then(([categories, series, languages, gradingCompanies]) => {
      setLookups({
        categories: categories.categories,
        series: series.series,
        languages: languages.languages,
        gradingCompanies: gradingCompanies.gradingCompanies,
      });
    });
  }, []);

  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function toggleBoolean(key) {
    set(key, filters[key] ? undefined : true);
  }

  const activeCount = Object.keys(filters).length;

  return (
    <div className="filter-bar">
      <div className="filter-bar-row">
        {showCategory && (
          <div className="filter-field">
            <label>Catégorie</label>
            <select className="select" value={filters.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value || undefined)}>
              <option value="">Tout</option>
              {lookups.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-field">
          <label>Édition</label>
          <select className="select" value={filters.seriesId ?? ''} onChange={(e) => set('seriesId', e.target.value || undefined)}>
            <option value="">Tout</option>
            {lookups.series.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-field filter-field-grow">
          <label>Nom</label>
          <input className="input" value={nameValue} onChange={(e) => onNameChange(e.target.value)} placeholder="Nom de la carte ou du produit" />
        </div>

        <div className="filter-checkboxes">
          <label className="checkbox-row">
            <input type="checkbox" checked={Boolean(filters.exact)} onChange={(e) => set('exact', e.target.checked || undefined)} />
            Nom exact
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={Boolean(filters.availableOnly)}
              onChange={(e) => set('availableOnly', e.target.checked || undefined)}
            />
            Disponibles seulement
          </label>
        </div>

        <button type="button" className="btn btn-primary filter-find-btn">TROUVER</button>
      </div>

      <button type="button" className="filter-more-toggle" onClick={() => setExpanded((v) => !v)}>
        Plus d'options {expanded ? '▲' : '▼'} {activeCount > 0 && <span className="filter-active-count">{activeCount}</span>}
      </button>

      {expanded && (
        <div className="filter-more-panel">
          <div className="filter-group">
            <div className="filter-group-title">État</div>
            <div className="filter-chip-row">
              {STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  className={`filter-chip ${filters.state === state ? 'active' : ''}`}
                  onClick={() => set('state', filters.state === state ? undefined : state)}
                >
                  {STATE_LABELS[state]}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-title">Langue</div>
            <select className="select" value={filters.languageId ?? ''} onChange={(e) => set('languageId', e.target.value || undefined)}>
              <option value="">Toutes les langues</option>
              {lookups.languages.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <div className="filter-group-title">Caractéristiques</div>
            <div className="filter-chip-row">
              {CHARACTERISTICS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={`filter-chip ${filters[key] ? 'active' : ''}`}
                  onClick={() => toggleBoolean(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-title">Gradation</div>
            <div className="filter-chip-row">
              <button
                type="button"
                className={`filter-chip ${filters.graded ? 'active' : ''}`}
                onClick={() => {
                  if (filters.graded) onChange({ ...filters, graded: undefined, gradingCompanyId: undefined });
                  else set('graded', true);
                }}
              >
                Gradée
              </button>
            </div>
            {filters.graded && (
              <select
                className="select"
                style={{ marginTop: 6 }}
                value={filters.gradingCompanyId ?? ''}
                onChange={(e) => set('gradingCompanyId', e.target.value || undefined)}
              >
                <option value="">Toutes les sociétés</option>
                {lookups.gradingCompanies.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            )}
          </div>

          {activeCount > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange({})}>
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
