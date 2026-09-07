import { useEffect, useRef, useState } from 'react';

// Sélecteur custom façon "menu déroulant" (bouton bicolore label/valeur +
// liste d'options en overlay) — remplace les <select> natifs dans les
// filtres, gabarit fourni par l'utilisateur (correction front/filtre).
export function FilterSelect({ icon, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className={`filter ${open ? 'open' : ''}`} ref={ref}>
      <button type="button" className="filter-btn" onClick={() => setOpen((v) => !v)}>
        <span className="filter-content">
          <span className="filter-label">{icon ? `${icon} ` : ''}{label}</span>
          <span className="filter-value">{current?.label}</span>
        </span>
        <span className="filter-chevron">⌄</span>
      </button>

      {open && (
        <div className="filter-menu">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              data-value={o.value}
              className={o.value === current?.value ? 'is-selected' : ''}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
