export function LoadingState() {
  return (
    <section className="state-card" role="status" aria-live="polite" aria-busy="true">
      <span className="loading-spinner" aria-hidden="true" />
      <h2>Cargando la colecta</h2>
      <p>Estamos consultando los últimos datos disponibles.</p>
    </section>
  )
}
