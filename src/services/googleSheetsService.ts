import type { GoogleSheetsRecord, GoogleSheetsResponse } from '../types/sheets'

interface UnknownRecord {
  [key: string]: unknown
}

export class GoogleSheetsServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GoogleSheetsServiceError'
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const text = value.trim()
  return text.length > 0 ? text : null
}

function toAmount(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const cleanedValue = value.trim().replace(/[^0-9,.-]/g, '')
  if (cleanedValue.length === 0) {
    return null
  }

  const lastComma = cleanedValue.lastIndexOf(',')
  const lastPeriod = cleanedValue.lastIndexOf('.')
  let normalizedValue = cleanedValue

  if (lastComma > lastPeriod) {
    normalizedValue = cleanedValue.replaceAll('.', '').replace(',', '.')
  } else if (lastPeriod > lastComma) {
    normalizedValue = cleanedValue.replaceAll(',', '')
  } else if (lastComma !== -1) {
    normalizedValue = cleanedValue.replace(',', '.')
  }

  const amount = Number(normalizedValue)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

function createRecordId(
  row: UnknownRecord,
  totalRecaudado: number,
  estado: string | null,
  existingIds: Map<string, number>,
): string {
  const suppliedId = toText(row.id)
  const baseId = suppliedId ?? `registro-${totalRecaudado}-${estado ?? 'sin-estado'}`
  const occurrence = existingIds.get(baseId) ?? 0

  existingIds.set(baseId, occurrence + 1)
  return occurrence === 0 ? baseId : `${baseId}-${occurrence + 1}`
}

function normalizeRecord(
  value: unknown,
  existingIds: Map<string, number>,
): GoogleSheetsRecord {
  if (!isRecord(value)) {
    throw new GoogleSheetsServiceError('La API contiene un registro con formato inválido.')
  }

  const totalRecaudado = toAmount(value.totalRecaudado)
  if (totalRecaudado === null) {
    throw new GoogleSheetsServiceError(
      'Cada registro debe incluir un totalRecaudado numérico mayor o igual a cero.',
    )
  }

  const estado = toText(value.estado)

  return {
    id: createRecordId(value, totalRecaudado, estado, existingIds),
    totalRecaudado,
    estado,
  }
}

function normalizeResponse(payload: unknown): GoogleSheetsResponse {
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new GoogleSheetsServiceError(
      'La respuesta de la API no contiene un arreglo data válido.',
    )
  }

  if (typeof payload.updatedAt !== 'string' || Number.isNaN(Date.parse(payload.updatedAt))) {
    throw new GoogleSheetsServiceError(
      'La respuesta de la API no contiene una fecha updatedAt válida.',
    )
  }

  const existingIds = new Map<string, number>()

  return {
    data: payload.data.map((record) => normalizeRecord(record, existingIds)),
    updatedAt: payload.updatedAt,
  }
}

function getApiUrl(): string {
  const apiUrl = import.meta.env.VITE_GOOGLE_SHEETS_API_URL?.trim()

  if (!apiUrl) {
    throw new GoogleSheetsServiceError(
      'Falta configurar VITE_GOOGLE_SHEETS_API_URL para consultar la hoja.',
    )
  }

  return apiUrl
}

export async function fetchGoogleSheetsData(signal: AbortSignal): Promise<GoogleSheetsResponse> {
  let response: Response

  try {
    response = await fetch(getApiUrl(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new GoogleSheetsServiceError(
      'No fue posible conectar con el servicio de Google Sheets. Revisa tu conexión e inténtalo otra vez.',
    )
  }

  if (!response.ok) {
    throw new GoogleSheetsServiceError(
      `El servicio de Google Sheets respondió con el estado ${response.status}.`,
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new GoogleSheetsServiceError('El servicio devolvió una respuesta que no es JSON válido.')
  }

  return normalizeResponse(payload)
}
