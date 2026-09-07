'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingBlock } from '@/components/common/Spinner';

// Équivalent du <ProtectedRoute> de l'ancien client : redirige vers
// /connexion si non authentifié, une fois la session vérifiée.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/connexion?from=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) return <LoadingBlock />;
  return <>{children}</>;
}
