import type { GoogleSheetsRecord } from '../types/sheets'
import { formatCurrency } from '../utils/formatDate'

interface DataTableProps {
  records: GoogleSheetsRecord[]
}

type StatusTone = 'neutral' | 'positive' | 'attention'

function getStatusTone(status: string | null): StatusTone {
  const normalizedStatus = status?.toLocaleLowerCase('es-AR') ?? ''

  if (normalizedStatus.includes('complet') || normalizedStatus.includes('confirm')) {
    return 'positive'
  }

  if (normalizedStatus.includes('pend') || normalizedStatus.includes('alert')) {
    return 'attention'
  }

  return 'neutral'
}

function getStatusLabel(status: string | null): string {
  return status ?? 'Sin estado'
}

export function DataTable({ records }: DataTableProps) {
  return (
    <section className="records-card" aria-labelledby="records-title">
      <div className="records-card__header">
        <div>
          <p className="eyebrow">Detalle sincronizado</p>
          <h2 id="records-title">Registros de la hoja</h2>
        </div>
        <span className="records-card__count">
          {records.length} {records.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      <div className="table-scroll" tabIndex={0} role="region" aria-label="Tabla de registros sincronizados">
        <table>
          <thead>
            <tr>
              <th scope="col">Registro</th>
              <th scope="col">Total recaudado</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const statusLabel = getStatusLabel(record.estado)
              const statusTone = getStatusTone(record.estado)

              return (
                <tr key={record.id}>
                  <td data-label="Registro">{record.id}</td>
                  <td data-label="Total recaudado" className="amount-cell">
                    {formatCurrency(record.totalRecaudado)}
                  </td>
                  <td data-label="Estado">
                    <span className={`status-badge status-badge--${statusTone}`}>
                      <span className="status-badge__dot" aria-hidden="true" />
                      {statusLabel}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
