import type { SVGProps } from 'react';

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
};

export const HomeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
);

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const GavelIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <path d="m14 6 4 4" />
    <path d="m6.5 12.5 5-5 4 4-5 5z" />
    <path d="M2 22l7-7" />
    <path d="m17 3 4 4" />
  </svg>
);

export const CollectionIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <rect x="4" y="4" width="6" height="16" rx="1" />
    <rect x="14" y="4" width="6" height="16" rx="1" />
  </svg>
);

export const CartIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h2l2.2 12.2a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.6L21 8H6" />
  </svg>
);

export const UserIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
  </svg>
);

export const MessageIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <path d="M4 5h16v11H8l-4 4V5Z" />
  </svg>
);

export const EyeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const TrendIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);

export const SparkleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
);

export const TagIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...common} {...p}>
    <path d="M12 3h6a2 2 0 0 1 2 2v6l-9 9-8-8 9-9Z" />
    <circle cx="15.5" cy="7.5" r="1.2" />
  </svg>
);
