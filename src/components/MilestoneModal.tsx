import { useEffect } from 'react'
import clubLogo from '../assets/images/@martinadiazph.png'
import { formatCurrency } from '../utils/formatDate'

interface MilestoneModalProps {
  amount: number | null
  onClose: () => void
}

export function MilestoneModal({ amount, onClose }: MilestoneModalProps) {
  useEffect(() => {
    if (amount === null) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [amount, onClose])

  if (amount === null) {
    return null
  }

  return (
    <div
      className="milestone-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="milestone-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-title"
        aria-describedby="milestone-description"
      >
        <button type="button" className="milestone-modal__close" onClick={onClose} aria-label="Cerrar mensaje" autoFocus>
          ×
        </button>
        <img className="milestone-modal__logo" src={clubLogo} alt="Escudo del Club Centro Fomento Los Hornos" />
        <p className="milestone-modal__eyebrow">Vamos Fomento</p>
        <h2 id="milestone-title">Ya llegamos a</h2>
        <strong className="milestone-modal__amount">{formatCurrency(amount)}</strong>
        <p id="milestone-description" className="milestone-modal__message">
          Cada aporte nos acerca al sueño de disputar nuestro primer torneo regional. ¡Sigamos alentando a la Primera!
        </p>
        <button type="button" className="button milestone-modal__button" onClick={onClose}>
          Seguir alentando
        </button>
      </section>
    </div>
  )
}
