// Specs §4 : une série s'affiche toujours "CODE : Nom", jamais le code seul.
export function formatSeries(series) {
  if (!series) return null;
  return `${series.code} : ${series.name}`;
}

export function serializeSeries(series) {
  if (!series) return null;
  return {
    id: series.id,
    code: series.code,
    name: series.name,
    label: formatSeries(series),
  };
}
