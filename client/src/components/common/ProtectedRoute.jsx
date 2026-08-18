import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LoadingBlock } from './Spinner.jsx';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingBlock />;
  if (!user) return <Navigate to="/connexion" state={{ from: location }} replace />;
  return <Outlet />;
}
