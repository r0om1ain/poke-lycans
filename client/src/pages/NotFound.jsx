import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState.jsx';

export function NotFound() {
  return (
    <div className="page">
      <EmptyState
        title="Page introuvable"
        description="Ce contenu n’existe pas ou plus."
        action={
          <Link to="/" className="btn btn-primary">
            Retour à l’accueil
          </Link>
        }
      />
    </div>
  );
}
