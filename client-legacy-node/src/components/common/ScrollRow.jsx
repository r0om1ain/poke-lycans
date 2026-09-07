import { useRef } from 'react';

export function ScrollRow({ children }) {
  const ref = useRef(null);

  function scrollBy(amount) {
    ref.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  return (
    <div className="scroll-row-wrap">
      <button type="button" className="scroll-arrow left" aria-label="Précédent" onClick={() => scrollBy(-320)}>‹</button>
      <div className="scroll-row" ref={ref}>
        {children}
      </div>
      <button type="button" className="scroll-arrow right" aria-label="Suivant" onClick={() => scrollBy(320)}>›</button>
    </div>
  );
}
