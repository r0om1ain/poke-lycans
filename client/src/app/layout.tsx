import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/context/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'TCGWorld',
  description: 'Marketplace communautaire d’achat et de vente de cartes et produits Pokémon.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <div className="app-shell">
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
