import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <strong className="footer__brand">TCGWorld</strong>
          <p>Marketplace communautaire d’achat et de vente de cartes et produits Pokémon.</p>
        </div>
        <div>
          <strong>Marketplace</strong>
          <Link href="/recherche">Cartes &amp; produits</Link>
          <Link href="/encheres">Enchères</Link>
          <Link href="/collection">Collection</Link>
        </div>
        <div>
          <strong>Compte</strong>
          <Link href="/compte">Mon compte</Link>
          <Link href="/panier">Panier</Link>
          <Link href="/connexion">Connexion</Link>
        </div>
      </div>
    </footer>
  );
}
