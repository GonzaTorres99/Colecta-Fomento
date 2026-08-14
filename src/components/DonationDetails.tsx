import { useEffect, useRef, useState } from 'react'

type DonationField = 'cbu' | 'alias'

const donationDetails: Record<DonationField, { label: string; value: string }> = {
  alias: { label: 'Alias', value: 'Fomento.regional' },
  cbu: { label: 'CBU', value: '4530000800018262248944' },
}

function copyWithFallback(value: string) {
  const textArea = document.createElement('textarea')
  textArea.value = value
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.append(textArea)
  textArea.select()

  const wasCopied = document.execCommand('copy')
  textArea.remove()

  return wasCopied
}

export function DonationDetails() {
  const [copiedField, setCopiedField] = useState<DonationField | null>(null)
  const [copyError, setCopyError] = useState(false)
  const resetTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current)
      }
    }
  }, [])

  const handleCopy = async (field: DonationField) => {
    const { value } = donationDetails[field]

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else if (!copyWithFallback(value)) {
        throw new Error('No se pudo copiar el dato.')
      }
    } catch {
      if (!copyWithFallback(value)) {
        setCopiedField(null)
        setCopyError(true)
        return
      }
    }

    setCopyError(false)
    setCopiedField(field)

    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current)
    }

    resetTimer.current = window.setTimeout(() => {
      setCopiedField(null)
    }, 2200)
  }

  return (
    <section className="donation-card" aria-labelledby="donation-title">
      <p className="donation-card__eyebrow">Sumate al torneo</p>
      <h2 id="donation-title">Pod&eacute;s donarnos a:</h2>

      <table className="donation-card__table">
        <tbody>
          {(Object.keys(donationDetails) as DonationField[]).map((field) => {
            const detail = donationDetails[field]
            const hasBeenCopied = copiedField === field

            return (
              <tr key={field}>
                <th scope="row">{detail.label}</th>
                <td>
                  <code>{detail.value}</code>
                </td>
                <td>
                  <button
                    type="button"
                    className="donation-card__copy"
                    onClick={() => void handleCopy(field)}
                    aria-label={`Copiar ${detail.label}: ${detail.value}`}
                  >
                    {hasBeenCopied ? 'Copiado' : 'Copiar'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="donation-card__feedback" aria-live="polite">
        {copyError ? 'No se pudo copiar. Intent&aacute nuevamente.' : copiedField ? `${donationDetails[copiedField].label} copiado.` : ''}
      </p>
    </section>
  )
}
