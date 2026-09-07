import type { ReactNode } from 'react';

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="state-block">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: 'var(--space-4)' }}>{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Une erreur est survenue.', action }: { message?: string; action?: ReactNode }) {
  return (
    <div className="state-block">
      <h3>Oups</h3>
      <p>{message}</p>
      {action && <div style={{ marginTop: 'var(--space-4)' }}>{action}</div>}
    </div>
  );
}
