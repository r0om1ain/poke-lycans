import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';
import { BottomNav } from './BottomNav.jsx';

export function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer className="footer">TCGWorld — marketplace communautaire de cartes et produits Pokémon.</footer>
      <BottomNav />
    </div>
  );
}
