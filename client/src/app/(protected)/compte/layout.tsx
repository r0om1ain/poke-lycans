'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { to: '/compte', label: 'Informations personnelles', end: true },
  { to: '/compte/messages', label: 'Messages' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="page">
      <h1 className="page-title">Mon compte</h1>
      <div className="account-layout">
        <nav className="account-sidebar-nav">
          {links.map((l) => {
            const active = l.end ? pathname === l.to : pathname.startsWith(l.to);
            return (
              <Link key={l.to} href={l.to} className={active ? 'active' : ''}>
                {l.label}
              </Link>
            );
          })}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-soft)', margin: '8px 4px' }} />
          <Link href="/achats">Mes achats</Link>
          <Link href="/ventes">Mes ventes</Link>
          <Link href="/mes-offres">Mes offres</Link>
          <Link href="/mes-encheres">Mes enchères</Link>
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
