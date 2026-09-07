'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export function NavDropdown({
  trigger,
  triggerClassName,
  children,
  align = 'left',
}: {
  trigger: ReactNode;
  triggerClassName?: string;
  children: ReactNode;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button type="button" className={triggerClassName} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {trigger}
      </button>
      {open && (
        <div className={`nav-dropdown-menu nav-dropdown-menu--${align}`} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}
