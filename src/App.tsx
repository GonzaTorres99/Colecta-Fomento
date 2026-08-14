import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CelebrationModal } from './components/CelebrationModal'
import { DonationDetails } from './components/DonationDetails'
import { EmptyState } from './components/EmptyState'
import { ErrorState } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { MilestoneModal } from './components/MilestoneModal'
import { ProgressBar } from './components/ProgressBar'
import { SyncStatus } from './components/SyncStatus'
import { useGoogleSheetsData } from './hooks/useGoogleSheetsData'
import clubLogo from './assets/images/@martinadiazph.png'
import teamPhoto from './assets/images/WhatsApp Image 2026-08-06 at 9.06.58 PM.jpeg'
import './App.css'

const COLLECTION_GOAL = 5_000_000
const MILESTONE_AMOUNTS = [500_000, 1_000_000, 1_500_000, 2_000_000, 2_500_000, 3_000_000, 4_000_000, 4_500_000] as const

function getReachedMilestone(total: number): number | null {
  if (total >= COLLECTION_GOAL) {
    return null
  }

  for (let index = MILESTONE_AMOUNTS.length - 1; index >= 0; index -= 1) {
    const milestone = MILESTONE_AMOUNTS[index]

    if (total >= milestone) {
      return milestone
    }
  }

  return null
}

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
  const [milestoneAmount, setMilestoneAmount] = useState<number | null>(null)
  const hasReachedGoalRef = useRef(false)
  const hasEvaluatedMilestoneRef = useRef(false)

  useEffect(() => {
    if (isGoalReached && !hasReachedGoalRef.current) {
      setIsCelebrationOpen(true)
      hasReachedGoalRef.current = true
    } else if (!isGoalReached) {
      hasReachedGoalRef.current = false
    }
  }, [isGoalReached])

  useEffect(() => {
    if (!hasSuccessfulSync || hasEvaluatedMilestoneRef.current) {
      return
    }

    hasEvaluatedMilestoneRef.current = true
    setMilestoneAmount(getReachedMilestone(totalRecaudado))
  }, [hasSuccessfulSync, totalRecaudado])

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
      <figure className="team-backdrop">
        <img src={teamPhoto} alt="Jugadores de Primera Division del Club Centro Fomento Los Hornos" />
      </figure>

      <header className="campaign-header">
        <div className="campaign-header__line" aria-hidden="true" />
        <div className="campaign-header__identity">
          <img className="campaign-header__logo" src={clubLogo} alt="Escudo del Club Centro Fomento Los Hornos" />
          <div>
            <p className="campaign-header__club">Club Centro Fomento Los Hornos</p>
            <h1>Colecta Fomento</h1>
          </div>
        </div>
        <p className="campaign-header__copy">
          La Primera Divisi&oacute;n de F&uacute;tbol del Club Centro Fomento Los Hornos busca recaudar $5.000.000
          para disputar su primer torneo regional. Acompa&ntilde;anos en esta colecta y ayudanos a llegar a
          nuestro objetivo.
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

        <div className="campaign-content">
          <div className="campaign-dashboard">
            {content}
            <DonationDetails />
          </div>
        </div>
      </section>

      <footer className="campaign-footer">
        <img className="campaign-footer__logo" src={clubLogo} alt="Escudo del Club Centro Fomento Los Hornos" />
        <div className="campaign-footer__author">
          <p>
            Hecho por{' '}
            <a
              className="campaign-footer__linkedin"
              href="https://www.linkedin.com/in/gonzalo-torres-67160327b"
              target="_blank"
              rel="noreferrer"
              aria-label="Visitar el perfil de LinkedIn de Gonzalo Torres"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5.14 3C3.96 3 3 3.96 3 5.14s.96 2.14 2.14 2.14 2.14-.96 2.14-2.14S6.32 3 5.14 3ZM3.29 8.91v11.8h3.7V8.91h-3.7Zm6.02 0v11.8h3.7v-5.84c0-1.54.29-3.03 2.2-3.03 1.88 0 1.9 1.76 1.9 3.13v5.74h3.7v-6.48c0-3.18-.68-5.63-4.4-5.63-1.79 0-2.99.98-3.48 1.91h-.05V8.91h-3.55Z" />
              </svg>
              <span>Gonzalo Torres</span>
            </a>
          </p>
          <a className="campaign-footer__email" href="mailto:gonzalotorres317@gmail.com">
            gonzalotorres317@gmail.com
          </a>
        </div>
      </footer>

      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        total={totalRecaudado}
      />
      <MilestoneModal amount={milestoneAmount} onClose={() => setMilestoneAmount(null)} />
    </main>
  )
}

export default App
