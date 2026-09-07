import { useEffect, useRef, useState } from 'react';

// Menu déroulant générique (façon "Vendre ▾" / "Acheter ▾" / "Produits ▾" de
// Cardmarket) : clic pour ouvrir, clic à l'extérieur ou Échap pour fermer.
export function NavDropdown({ trigger, triggerClassName, children, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
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
