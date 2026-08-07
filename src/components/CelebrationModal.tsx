import { useEffect } from 'react'
import { formatCurrency } from '../utils/formatDate'

interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
}

export function CelebrationModal({ isOpen, onClose, total }: CelebrationModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="celebration-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section className="celebration-modal__panel" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
        <span className="celebration-modal__seal" aria-hidden="true">
          CF
        </span>
        <p className="celebration-modal__eyebrow">Objetivo cumplido</p>
        <h2 id="celebration-title">Felicitaciones, terminamos la colecta</h2>
        <p className="celebration-modal__thanks">
          Gracias a todas las personas que colaboraron y a quienes difundieron esta causa.
        </p>
        <div className="celebration-modal__total">
          <span>Recaudado para la silla de ruedas</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        <button type="button" className="button celebration-modal__button" onClick={onClose} autoFocus>
          Ver el avance
        </button>
      </section>
    </div>
  )
}
