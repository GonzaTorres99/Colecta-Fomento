const ARGENTINA_LOCALE = 'es-AR'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(ARGENTINA_LOCALE, {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDateTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible'
  }

  return new Intl.DateTimeFormat(ARGENTINA_LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
