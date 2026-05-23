const SYMBOL_REGEX = /^[A-Z0-9]{1,6}$/

export function validateSymbol(symbol: string): string {
  const upper = symbol.toUpperCase().trim()
  if (!SYMBOL_REGEX.test(upper)) {
    throw new Error(
      `Invalid symbol: "${symbol}". Must be 1-6 uppercase alphanumeric characters.`
    )
  }
  return upper
}

export function validatePositiveInt(value: number, max = 100): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid value: ${value}. Must be a positive integer.`)
  }
  if (value > max) {
    throw new Error(`Invalid value: ${value}. Must be at most ${max}.`)
  }
  return value
}

export function formatIDR(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toLocaleString('id-ID')
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function sanitizeQuery(query: string): string {
  const trimmed = query.trim()
  if (trimmed.length === 0) {
    throw new Error('Search query cannot be empty.')
  }
  if (trimmed.length > 100) {
    throw new Error('Search query too long (max 100 characters).')
  }
  return trimmed
}
