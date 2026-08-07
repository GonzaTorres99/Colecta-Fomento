export interface GoogleSheetsRecord {
  id: string
  totalRecaudado: number
  estado: string | null
}

export interface GoogleSheetsResponse {
  data: GoogleSheetsRecord[]
  updatedAt: string
}
