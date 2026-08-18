import { useEffect, useState } from 'react';
import { catalogApi } from '../../api/catalog.js';
import { STATE_LABELS } from '../../lib/format.js';

const CHARACTERISTICS = [
  { key: 'holo', label: 'Holo' },
  { key: 'firstEdition', label: '1re édition' },
  { key: 'pokeball', label: 'Poké Ball' },
  { key: 'miscutMisprint', label: 'Miscut / Misprint' },
  { key: 'stamp', label: 'Stamp' },
  { key: 'reverse', label: 'Reverse' },
];

// Champs communs à un exemplaire (mise en vente, enchère, collection) —
// specs §6-9 : tout est facultatif, y compris état et langue.
export function ExemplarFormFields({ value, onChange }) {
  const [lookups, setLookups] = useState({ languages: [], gradingCompanies: [] });

  useEffect(() => {
    Promise.all([catalogApi.languages(), catalogApi.gradingCompanies()]).then(
      ([languages, gradingCompanies]) => {
        setLookups({ languages: languages.languages, gradingCompanies: gradingCompanies.gradingCompanies });
      },
    );
  }, []);

  function set(key, v) {
    onChange({ ...value, [key]: v });
  }

  return (
    <>
      <div className="field">
        <label htmlFor="state">État</label>
        <select id="state" className="select" value={value.state ?? ''} onChange={(e) => set('state', e.target.value || undefined)}>
          <option value="">Non précisé</option>
          {Object.entries(STATE_LABELS).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="languageId">Langue</label>
        <select id="languageId" className="select" value={value.languageId ?? ''} onChange={(e) => set('languageId', e.target.value || undefined)}>
          <option value="">Non précisée</option>
          {lookups.languages.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="field quick-panel__span">
        <label>Caractéristiques</label>
        {CHARACTERISTICS.map(({ key, label }) => (
          <label key={key} className="checkbox-row">
            <input type="checkbox" checked={Boolean(value[key])} onChange={(e) => set(key, e.target.checked)} />
            {label}
          </label>
        ))}
      </div>

      <div className="field">
        <label className="checkbox-row">
          <input type="checkbox" checked={Boolean(value.graded)} onChange={(e) => set('graded', e.target.checked)} />
          Gradée
        </label>
      </div>

      {value.graded && (
        <>
          <div className="field">
            <label htmlFor="gradingCompanyId">Société de gradation</label>
            <select
              id="gradingCompanyId"
              className="select"
              value={value.gradingCompanyId ?? ''}
              onChange={(e) => set('gradingCompanyId', e.target.value || undefined)}
            >
              <option value="">Sélectionner</option>
              {lookups.gradingCompanies.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="gradingNote">Note</label>
            <input
              id="gradingNote"
              className="input"
              value={value.gradingNote ?? ''}
              onChange={(e) => set('gradingNote', e.target.value)}
              placeholder="Ex : 10"
            />
          </div>
        </>
      )}
    </>
  );
}
