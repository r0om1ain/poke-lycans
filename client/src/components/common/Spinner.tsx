export function Spinner() {
  return <div className="spinner" role="status" aria-label="Chargement" />;
}

export function LoadingBlock() {
  return (
    <div className="state-block">
      <Spinner />
    </div>
  );
}
