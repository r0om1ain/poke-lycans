import { STATE_SHORT_LABELS } from '@/lib/format';
import type { Caracteristiques, Langue, SocieteGradation } from '@/types';

const CHARACTERISTIC_LABELS: Record<string, string> = {
  holo: 'Holo',
  edition1: '1re édition',
  pokeball: 'Poké Ball',
  misscut: 'Miscut',
  missprint: 'Missprint',
  stamp: 'Stamp',
  reverse: 'Reverse',
};

export function ExemplarBadges({
  item,
  compact = false,
  langues,
  societes,
}: {
  item?: Caracteristiques | null;
  compact?: boolean;
  langues?: Langue[];
  societes?: SocieteGradation[];
}) {
  if (!item) return null;
  const badges: React.ReactNode[] = [];

  if (item.etat) {
    const cls = `badge badge-state badge-state-${item.etat.toLowerCase()}`;
    badges.push(<span key="etat" className={cls}>{STATE_SHORT_LABELS[item.etat] ?? item.etat}</span>);
  }
  if (item.idLangue != null) {
    const langue = langues?.find((l) => l.id === item.idLangue);
    if (langue) badges.push(<span key="lang" className="badge badge-neutral">{langue.nom}</span>);
  }

  for (const [key, label] of Object.entries(CHARACTERISTIC_LABELS)) {
    if ((item as unknown as Record<string, boolean>)[key]) badges.push(<span key={key} className="badge badge-accent">{label}</span>);
  }

  if (item.grade) {
    const societe = societes?.find((s) => s.id === item.idSocieteGradation);
    const parts = [societe?.nom, item.noteGradation].filter((v) => v !== null && v !== undefined).join(' ');
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
