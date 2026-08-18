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

// Filtres partagés Recherche (§12) / Enchères (§39) : type, série, nom (géré
// par la page hôte), caractéristiques facultatives combinables.
export function FilterPanel({ filters, onChange, showCategory = true }) {
  const [lookups, setLookups] = useState({ categories: [], series: [], languages: [], gradingCompanies: [] });

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

  function reset() {
    onChange({});
  }

  return (
    <div className="filter-panel">
      {showCategory && (
        <div className="filter-group">
          <div className="filter-group-title">Type d'item</div>
          <div className="filter-chip-row">
            {lookups.categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`filter-chip ${filters.categoryId === c.id ? 'active' : ''}`}
                onClick={() => set('categoryId', filters.categoryId === c.id ? undefined : c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="filter-group">
        <div className="filter-group-title">Série</div>
        <select
          className="select"
          value={filters.seriesId ?? ''}
          onChange={(e) => set('seriesId', e.target.value || undefined)}
        >
          <option value="">Toutes les séries</option>
          {lookups.series.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

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
        <select
          className="select"
          value={filters.languageId ?? ''}
          onChange={(e) => set('languageId', e.target.value || undefined)}
        >
          <option value="">Toutes les langues</option>
          {lookups.languages.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <div className="filter-group-title">Caractéristiques</div>
        {CHARACTERISTICS.map(({ key, label }) => (
          <div key={key} className="filter-toggle-row">
            <span>{label}</span>
            <button
              type="button"
              className={`switch ${filters[key] ? 'on' : ''}`}
              aria-pressed={Boolean(filters[key])}
              onClick={() => toggleBoolean(key)}
            />
          </div>
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-toggle-row">
          <span>Gradée</span>
          <button
            type="button"
            className={`switch ${filters.graded ? 'on' : ''}`}
            aria-pressed={Boolean(filters.graded)}
            onClick={() => {
              if (filters.graded) {
                onChange({ ...filters, graded: undefined, gradingCompanyId: undefined });
              } else {
                set('graded', true);
              }
            }}
          />
        </div>
        {filters.graded && (
          <select
            className="select"
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

      <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
        Réinitialiser les filtres
      </button>
    </div>
  );
}
