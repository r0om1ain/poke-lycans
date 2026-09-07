// Dégradés de repli pour les produits sans image.
const GRADIENTS = [
  'linear-gradient(145deg, #e9bd36, #c98525 46%, #496ba9)',
  'linear-gradient(145deg, #65b9e8, #1b77b7 55%, #284e91)',
  'linear-gradient(145deg, #9770b8, #673e8d 55%, #352557)',
  'linear-gradient(145deg, #78ba61, #3a854a 52%, #255f62)',
  'linear-gradient(145deg, #e98ca7, #aa5579 52%, #594f8f)',
  'linear-gradient(145deg, #e9a248, #c75837 52%, #5d427c)',
  'linear-gradient(145deg, #ad8566, #725e55 52%, #395b70)',
  'linear-gradient(145deg, #afb7bf, #68727c 52%, #344758)',
];

export function gradientFor(seed: string | number): string {
  const key = typeof seed === 'string' ? seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : seed;
  return GRADIENTS[key % GRADIENTS.length];
}

export function initials(name?: string | null): string {
  return (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
