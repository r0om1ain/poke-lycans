'use client';

import { useEffect, useRef, useState } from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export function FilterSelect({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon?: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
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
