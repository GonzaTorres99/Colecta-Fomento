import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CelebrationModal } from './components/CelebrationModal'
import { EmptyState } from './components/EmptyState'
import { ErrorState } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { ProgressBar } from './components/ProgressBar'
import { SyncStatus } from './components/SyncStatus'
import { useGoogleSheetsData } from './hooks/useGoogleSheetsData'
import './App.css'

const COLLECTION_GOAL = 5_000_000

function App() {
  const {
    data,
    error,
    hasSuccessfulSync,
    isInitialLoading,
    isRefreshing,
    lastSyncedAt,
    refresh,
  } = useGoogleSheetsData()

  const totalRecaudado = data.reduce((total, record) => total + record.totalRecaudado, 0)
  const isGoalReached = hasSuccessfulSync && totalRecaudado >= COLLECTION_GOAL
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false)
  const hasReachedGoalRef = useRef(false)

  useEffect(() => {
    if (isGoalReached && !hasReachedGoalRef.current) {
      setIsCelebrationOpen(true)
      hasReachedGoalRef.current = true
    } else if (!isGoalReached) {
      hasReachedGoalRef.current = false
    }
  }, [isGoalReached])

  const handleRefresh = () => {
    void refresh()
  }

  let content: ReactNode

  if (isInitialLoading && !hasSuccessfulSync) {
    content = <LoadingState />
  } else if (error && !hasSuccessfulSync) {
    content = <ErrorState message={error} onRetry={handleRefresh} isRetrying={isRefreshing} />
  } else if (data.length === 0) {
    content = <EmptyState />
  } else {
    content = <ProgressBar total={totalRecaudado} goal={COLLECTION_GOAL} />
  }

  return (
    <main className="campaign-page">
      <header className="campaign-header">
        <div className="campaign-header__line" aria-hidden="true" />
        <p className="campaign-header__club">Club Centro Fomento Los Hornos</p>
        <h1>Colecta Fomento</h1>
        <p className="campaign-header__copy">
          Los jugadores de Primera Divisi&oacute;n del Club Centro Fomento Los Hornos est&aacute;n ayudando a una
          familia a recaudar $5.000.000 para que un ni&ntilde;o consiga una silla de ruedas.
        </p>
      </header>

      <section className="campaign-stage" aria-label="Avance de la colecta">
        <div className="campaign-tools">
          <SyncStatus
            error={hasSuccessfulSync ? error : null}
            isInitialLoading={isInitialLoading}
            isRefreshing={isRefreshing}
            lastSyncedAt={lastSyncedAt}
          />
          <button
            type="button"
            className="button button--primary"
            onClick={handleRefresh}
            disabled={isInitialLoading || isRefreshing}
          >
            <span
              className={isInitialLoading || isRefreshing ? 'button__spinner' : 'button__refresh'}
              aria-hidden="true"
            >
              &#8635;
            </span>
            {isInitialLoading || isRefreshing ? 'Actualizando...' : 'Actualizar monto'}
          </button>
        </div>

        <div className="campaign-content">{content}</div>
      </section>

      <footer className="campaign-footer">Hecho por Gonzalo Torres</footer>

      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        total={totalRecaudado}
      />
    </main>
  )
}

export default App
