export function EmptyState() {
  return (
    <section className="state-card" aria-live="polite">
      <span className="state-card__icon state-card__icon--muted" aria-hidden="true">
        0
      </span>
      <h2>Aún no hay registros</h2>
      <p>La hoja se sincronizó correctamente, pero todavía no contiene datos para mostrar.</p>
    </section>
  )
}
