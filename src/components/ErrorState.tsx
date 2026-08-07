interface ErrorStateProps {
  isRetrying: boolean
  message: string
  onRetry: () => void
}

export function ErrorState({ isRetrying, message, onRetry }: ErrorStateProps) {
  return (
    <section className="state-card state-card--error" role="alert">
      <span className="state-card__icon" aria-hidden="true">
        !
      </span>
      <h2>No se pudieron cargar los datos</h2>
      <p>{message}</p>
      <button type="button" className="button button--secondary" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? 'Reintentando…' : 'Reintentar'}
      </button>
    </section>
  )
}
