// Specs §4 : une série s'affiche toujours "CODE : Nom" — jamais le code seul.
export function SeriesLabel({ series, className = '' }) {
  if (!series) return null;
  return <span className={`series-label ${className}`}>{series.label}</span>;
}
