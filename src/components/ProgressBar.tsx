import { formatCurrency } from '../utils/formatDate'

interface ProgressBarProps {
  goal: number
  total: number
}

export function ProgressBar({ goal, total }: ProgressBarProps) {
  const percentage = goal > 0 ? Math.min((total / goal) * 100, 100) : 0
  const remainingAmount = Math.max(goal - total, 0)
  const isGoalReached = total >= goal
  const markerPosition = `clamp(1.5rem, ${percentage}%, calc(100% - 1.5rem))`

  return (
    <section className="progress-card" aria-labelledby="progress-title">
      <div className="progress-card__heading">
        <p className="progress-card__kicker">Marcador solidario</p>
        <p className="progress-card__percentage">{percentage.toFixed(1)}%</p>
      </div>

      <div className="progress-card__amount">
        <span>Recaudado</span>
        <h2 id="progress-title">{formatCurrency(total)}</h2>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-label="Progreso de la colecta"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(percentage.toFixed(1))}
        aria-valuetext={`${percentage.toFixed(1)}% recaudado`}
      >
        <div className="progress-track__value" style={{ width: `${percentage}%` }} />
        <span className="progress-track__marker" style={{ left: markerPosition }} aria-hidden="true">
          CF
        </span>
      </div>

      <div className="progress-card__labels" aria-hidden="true">
        <span>Inicio</span>
        <span>Meta: {formatCurrency(goal)}</span>
      </div>

      <div className="progress-card__message">
        <p>{isGoalReached ? 'Objetivo cumplido' : 'Todav\u00eda falta para llegar'}</p>
        <strong>{isGoalReached ? 'La comunidad lo logro' : formatCurrency(remainingAmount)}</strong>
      </div>
    </section>
  )
}
