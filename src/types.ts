export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  prevClose: number
  marketCap?: number
  currency: string
}

export interface IndexValue {
  name: string
  value: number
  change: number
  changePercent: number
}

export interface SearchResult {
  symbol: string
  name: string
  exchange: string
}

export interface ClientOptions {
  timeout: number
  userAgent: string
}
