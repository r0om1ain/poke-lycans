export function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return `${n.toFixed(2).replace('.', ',')} €`;
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Compte à rebours court style prototype : "2j 14h", "3h 12m", "45s"
export function formatCountdown(endAt) {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return 'Terminée';
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export const STATE_LABELS = {
  NM: 'NM',
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  LP: 'LP',
  PLAYED: 'Played',
};
