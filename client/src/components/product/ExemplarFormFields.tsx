'use client';

import { useEffect, useState } from 'react';
import { catalogApi } from '@/lib/api/catalog';
import { STATE_LABELS } from '@/lib/format';
import type { Langue, SocieteGradation } from '@/types';

const CHARACTERISTICS = [
  { key: 'holo', label: 'Holo' },
  { key: 'edition1', label: '1re édition' },
  { key: 'pokeball', label: 'Poké Ball' },
  { key: 'misscut', label: 'Miscut' },
  { key: 'missprint', label: 'Missprint' },
  { key: 'stamp', label: 'Stamp' },
  { key: 'reverse', label: 'Reverse' },
];

export function ExemplarFormFields<T extends Record<string, unknown>>({ value, onChange }: { value: T; onChange: (v: T) => void }) {
  const [lookups, setLookups] = useState<{ langues: Langue[]; societes: SocieteGradation[] }>({ langues: [], societes: [] });

  useEffect(() => {
    Promise.all([catalogApi.langues().catch(() => []), catalogApi.societesGradation().catch(() => [])]).then(([langues, societes]) => {
      setLookups({ langues, societes });
    });
  }, []);

  function set(key: string, v: unknown) {
    onChange({ ...value, [key]: v });
  }

  return (
    <>
      <div className="field">
        <label htmlFor="etat">État</label>
        <select id="etat" className="select" value={(value.etat as string) ?? ''} onChange={(e) => set('etat', e.target.value || undefined)}>
          <option value="">Non précisé</option>
          {Object.entries(STATE_LABELS).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="idLangue">Langue</label>
        <select id="idLangue" className="select" value={(value.idLangue as string) ?? ''} onChange={(e) => set('idLangue', e.target.value || undefined)}>
          <option value="">Non précisée</option>
          {lookups.langues.map((l) => (
            <option key={l.id} value={l.id}>{l.nom}</option>
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
          <input type="checkbox" checked={Boolean(value.grade)} onChange={(e) => set('grade', e.target.checked)} />
          Gradée
        </label>
      </div>

      {Boolean(value.grade) && (
        <>
          <div className="field">
            <label htmlFor="idSocieteGradation">Société de gradation</label>
            <select
              id="idSocieteGradation"
              className="select"
              value={(value.idSocieteGradation as string) ?? ''}
              onChange={(e) => set('idSocieteGradation', e.target.value || undefined)}
            >
              <option value="">Sélectionner</option>
              {lookups.societes.map((g) => (
                <option key={g.id} value={g.id}>{g.nom}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="noteGradation">Note</label>
            <input
              id="noteGradation"
              className="input"
              value={(value.noteGradation as string) ?? ''}
              onChange={(e) => set('noteGradation', e.target.value)}
              placeholder="Ex : 10"
            />
          </div>
        </>
      )}
    </>
  );
}
