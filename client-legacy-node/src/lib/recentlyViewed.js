const KEY = 'tcgworld_recently_viewed';
const MAX = 12;

export function pushRecentlyViewed(productId) {
  try {
    const current = getRecentlyViewed().filter((id) => id !== productId);
    current.unshift(productId);
    localStorage.setItem(KEY, JSON.stringify(current.slice(0, MAX)));
  } catch {
    // localStorage indisponible (navigation privée...) — pas bloquant.
  }
}

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
