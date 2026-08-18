export function EmptyState({ title, description, action }) {
  return (
    <div className="state-block">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: 'var(--space-4)' }}>{action}</div>}
    </div>
  );
}

export function ErrorState({ message = "Une erreur est survenue.", action }) {
  return (
    <div className="state-block">
      <h3>Oups</h3>
      <p>{message}</p>
      {action && <div style={{ marginTop: 'var(--space-4)' }}>{action}</div>}
    </div>
  );
}
