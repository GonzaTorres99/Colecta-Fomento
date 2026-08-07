import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchGoogleSheetsData,
  GoogleSheetsServiceError,
} from '../services/googleSheetsService'
import type { GoogleSheetsRecord } from '../types/sheets'

const DEFAULT_SYNC_INTERVAL = 30_000
const MINIMUM_SYNC_INTERVAL = 1_000

function getSyncInterval(): number {
  const configuredInterval = Number(import.meta.env.VITE_SHEETS_SYNC_INTERVAL)

  if (!Number.isFinite(configuredInterval) || configuredInterval < MINIMUM_SYNC_INTERVAL) {
    return DEFAULT_SYNC_INTERVAL
  }

  return Math.floor(configuredInterval)
}

function getErrorMessage(error: unknown): string {
  if (error instanceof GoogleSheetsServiceError) {
    return error.message
  }

  return 'No pudimos actualizar los datos. Inténtalo nuevamente.'
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export interface GoogleSheetsDataState {
  data: GoogleSheetsRecord[]
  error: string | null
  hasSuccessfulSync: boolean
  isInitialLoading: boolean
  isRefreshing: boolean
  lastSyncedAt: Date | null
  sheetUpdatedAt: string | null
  refresh: () => Promise<void>
}

export function useGoogleSheetsData(): GoogleSheetsDataState {
  const [data, setData] = useState<GoogleSheetsRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasSuccessfulSync, setHasSuccessfulSync] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const [sheetUpdatedAt, setSheetUpdatedAt] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const hasSuccessfulSyncRef = useRef(false)
  const isMountedRef = useRef(false)
  const requestInFlightRef = useRef(false)

  const refresh = useCallback(async (): Promise<void> => {
    if (requestInFlightRef.current) {
      return
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController
    requestInFlightRef.current = true

    if (isMountedRef.current) {
      if (hasSuccessfulSyncRef.current) {
        setIsRefreshing(true)
      } else {
        setIsInitialLoading(true)
      }
    }

    try {
      const response = await fetchGoogleSheetsData(abortController.signal)

      if (!isMountedRef.current) {
        return
      }

      setData(response.data)
      setError(null)
      setHasSuccessfulSync(true)
      setLastSyncedAt(new Date())
      setSheetUpdatedAt(response.updatedAt)
      hasSuccessfulSyncRef.current = true
    } catch (requestError) {
      if (isAbortError(requestError) || !isMountedRef.current) {
        return
      }

      setError(getErrorMessage(requestError))
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
        requestInFlightRef.current = false

        if (isMountedRef.current) {
          setIsInitialLoading(false)
          setIsRefreshing(false)
        }
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    const pollingInterval = window.setInterval(() => {
      void refresh()
    }, getSyncInterval())

    void refresh()

    return () => {
      isMountedRef.current = false
      window.clearInterval(pollingInterval)
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      requestInFlightRef.current = false
    }
  }, [refresh])

  return {
    data,
    error,
    hasSuccessfulSync,
    isInitialLoading,
    isRefreshing,
    lastSyncedAt,
    sheetUpdatedAt,
    refresh,
  }
}
