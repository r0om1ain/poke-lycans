import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';

export default function NotFound() {
  return (
    <div className="page">
      <EmptyState
        title="Page introuvable"
        description="Ce contenu n’existe pas ou plus."
        action={
          <Link href="/" className="btn btn-primary">
            Retour à l’accueil
          </Link>
        }
      />
    </div>
  );
}
