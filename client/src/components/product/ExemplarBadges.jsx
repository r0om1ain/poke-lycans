import { STATE_LABELS } from '../../lib/format.js';

const CHARACTERISTIC_LABELS = {
  holo: 'Holo',
  firstEdition: '1re édition',
  pokeball: 'Poké Ball',
  miscutMisprint: 'Miscut/Misprint',
  stamp: 'Stamp',
  reverse: 'Reverse',
};

// Rend uniquement les caractéristiques réellement renseignées — toutes sont
// facultatives (specs §6-9), on n'affiche jamais un badge "OFF" ou vide.
export function ExemplarBadges({ item, compact = false }) {
  if (!item) return null;
  const badges = [];

  if (item.state) badges.push(<span key="state" className="badge badge-neutral">{STATE_LABELS[item.state] ?? item.state}</span>);
  if (item.language) badges.push(<span key="lang" className="badge badge-neutral">{item.language.name}</span>);

  for (const [key, label] of Object.entries(CHARACTERISTIC_LABELS)) {
    if (item[key]) badges.push(<span key={key} className="badge badge-accent">{label}</span>);
  }

  if (item.graded) {
    const parts = [item.gradingCompany?.name, item.gradingNote].filter(Boolean).join(' ');
    badges.push(
      <span key="graded" className="badge badge-success">
        Gradée{parts ? ` · ${parts}` : ''}
      </span>,
    );
  }

  if (badges.length === 0 && !compact) {
    return <span className="badge badge-neutral">Sans caractéristique précisée</span>;
  }

  return <div className="exemplar-badges">{badges}</div>;
}
