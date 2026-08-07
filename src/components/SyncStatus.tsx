import { formatDateTime } from '../utils/formatDate'

interface SyncStatusProps {
  error: string | null
  isInitialLoading: boolean
  isRefreshing: boolean
  lastSyncedAt: Date | null
}

export function SyncStatus({ error, isInitialLoading, isRefreshing, lastSyncedAt }: SyncStatusProps) {
  const isSyncing = isInitialLoading || isRefreshing
  const syncMessage = isSyncing
    ? 'Consultando la planilla...'
    : lastSyncedAt
      ? `Actualizado ${formatDateTime(lastSyncedAt)}`
      : 'Pendiente de actualizacion'

  return (
    <div className="sync-status" aria-live="polite">
      <div className="sync-status__main">
        <span
          className={`sync-status__indicator${isSyncing ? ' sync-status__indicator--syncing' : ''}`}
          aria-hidden="true"
        />
        <span>{syncMessage}</span>
      </div>
      {error ? <p className="sync-status__warning">No se pudo actualizar. Se conserva el ultimo monto.</p> : null}
    </div>
  )
}
