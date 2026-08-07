const SHEET_INDEX = 0
const AMOUNT_CELL = 'A2'

/**
 * Public endpoint for the React application.
 *
 * Create this script from Extensions > Apps Script in the target spreadsheet.
 * It reads only cell A2 from the first sheet tab.
 */
function doGet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getSheets()[SHEET_INDEX]

  if (!sheet) {
    throw new Error('No se encontro la primera pestana de la hoja de calculo.')
  }

  const amount = parseAmount(sheet.getRange(AMOUNT_CELL).getDisplayValue())
  const response = {
    data:
      amount === null
        ? []
        : [
            {
              id: 'total-recaudado',
              totalRecaudado: amount,
              estado: 'Actualizado',
            },
          ],
    updatedAt: new Date().toISOString(),
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

/**
 * Returns null for an empty A2 and accepts common ARS numeric formats, for
 * example: 5000000, 5.000.000 or $ 5.000.000,00.
 */
function parseAmount(value) {
  const rawValue = String(value).trim()

  if (!rawValue) {
    return null
  }

  const cleanedValue = rawValue.replace(/[^0-9,.-]/g, '')
  const commaCount = (cleanedValue.match(/,/g) || []).length
  const periodCount = (cleanedValue.match(/\./g) || []).length
  const lastComma = cleanedValue.lastIndexOf(',')
  const lastPeriod = cleanedValue.lastIndexOf('.')
  let normalizedValue = cleanedValue

  if (commaCount > 0 && periodCount > 0) {
    normalizedValue =
      lastComma > lastPeriod
        ? cleanedValue.replace(/\./g, '').replace(',', '.')
        : cleanedValue.replace(/,/g, '')
  } else if (commaCount > 0) {
    const decimalDigits = cleanedValue.length - lastComma - 1
    normalizedValue =
      commaCount > 1 || decimalDigits === 3
        ? cleanedValue.replace(/,/g, '')
        : cleanedValue.replace(',', '.')
  } else if (periodCount > 1) {
    normalizedValue = cleanedValue.replace(/\./g, '')
  }

  const amount = Number(normalizedValue)

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('La celda A2 debe contener un monto numerico mayor o igual a cero.')
  }

  return amount
}
