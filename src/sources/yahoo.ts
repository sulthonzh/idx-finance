import { client } from '../client.js'
import type { StockQuote, IndexValue, SearchResult } from '../types.js'
import { validateSymbol, sanitizeQuery, validatePositiveInt } from '../utils.js'

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number
        previousClose?: number
        chartPreviousClose?: number
        currency?: string
        shortName?: string
        symbol?: string
        regularMarketVolume?: number
      }
    }>
    error?: unknown
  }
}

interface YahooQuoteResponse {
  quoteResponse?: {
    result?: Array<{
      symbol?: string
      shortName?: string
      regularMarketPrice?: number
      regularMarketChange?: number
      regularMarketChangePercent?: number
      regularMarketVolume?: number
      regularMarketDayHigh?: number
      regularMarketDayLow?: number
      regularMarketOpen?: number
      regularMarketPreviousClose?: number
      marketCap?: number
      currency?: string
    }>
    error?: unknown
  }
}

function toStockQuote(raw: NonNullable<YahooQuoteResponse['quoteResponse']>['result'] extends Array<infer T> | undefined ? T : never): StockQuote {
  return {
    symbol: (raw.symbol ?? '').replace('.JK', ''),
    name: raw.shortName ?? '',
    price: raw.regularMarketPrice ?? 0,
    change: raw.regularMarketChange ?? 0,
    changePercent: raw.regularMarketChangePercent ?? 0,
    volume: raw.regularMarketVolume ?? 0,
    high: raw.regularMarketDayHigh ?? 0,
    low: raw.regularMarketDayLow ?? 0,
    open: raw.regularMarketOpen ?? 0,
    prevClose: raw.regularMarketPreviousClose ?? 0,
    marketCap: raw.marketCap,
    currency: raw.currency ?? 'IDR',
  }
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  const sym = validateSymbol(symbol)
  const url = `https://query1.finance.yahoo.com/v6/finance/quote?symbols=${encodeURIComponent(sym + '.JK')}`
  const data = (await client.fetch(url)) as YahooQuoteResponse

  if (data.quoteResponse?.error) {
    throw new Error(`Yahoo API error: ${JSON.stringify(data.quoteResponse.error)}`)
  }

  const result = data.quoteResponse?.result?.[0]
  if (!result) {
    throw new Error(`No data found for symbol: ${sym}`)
  }

  return toStockQuote(result)
}

export async function getQuotes(symbols: string[]): Promise<StockQuote[]> {
  if (symbols.length === 0) return []
  if (symbols.length > 50) throw new Error('Maximum 50 symbols per batch request')

  const validated = symbols.map(validateSymbol)
  const symbolsParam = validated.map((s) => s + '.JK').join(',')
  const url = `https://query1.finance.yahoo.com/v6/finance/quote?symbols=${encodeURIComponent(symbolsParam)}`
  const data = (await client.fetch(url)) as YahooQuoteResponse

  if (data.quoteResponse?.error) {
    throw new Error(`Yahoo API error: ${JSON.stringify(data.quoteResponse.error)}`)
  }

  return (data.quoteResponse?.result ?? []).map(toStockQuote)
}

export async function getTopGainers(n = 10): Promise<StockQuote[]> {
  const count = validatePositiveInt(n, 50)
  const url = `https://query1.finance.yahoo.com/v1/finance/trending/ID`
  const trendingData = (await client.fetch(url)) as {
    finance?: { result?: Array<{ quotes?: Array<{ symbol?: string }> }> }
  }

  const trendingSymbols = trendingData.finance?.result?.[0]?.quotes ?? []
  if (trendingSymbols.length === 0) return []

  const symbols = trendingSymbols
    .slice(0, 50)
    .map((q) => q.symbol ?? '')
    .filter((s) => s.endsWith('.JK'))

  if (symbols.length === 0) return []

  const symbolsParam = symbols.join(',')
  const quoteUrl = `https://query1.finance.yahoo.com/v6/finance/quote?symbols=${encodeURIComponent(symbolsParam)}`
  const data = (await client.fetch(quoteUrl)) as YahooQuoteResponse

  const quotes = (data.quoteResponse?.result ?? []).map(toStockQuote)
  return quotes
    .filter((q) => q.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, count)
}

export async function getTopLosers(n = 10): Promise<StockQuote[]> {
  const count = validatePositiveInt(n, 50)
  const url = `https://query1.finance.yahoo.com/v1/finance/trending/ID`
  const trendingData = (await client.fetch(url)) as {
    finance?: { result?: Array<{ quotes?: Array<{ symbol?: string }> }> }
  }

  const trendingSymbols = trendingData.finance?.result?.[0]?.quotes ?? []
  if (trendingSymbols.length === 0) return []

  const symbols = trendingSymbols
    .slice(0, 50)
    .map((q) => q.symbol ?? '')
    .filter((s) => s.endsWith('.JK'))

  if (symbols.length === 0) return []

  const symbolsParam = symbols.join(',')
  const quoteUrl = `https://query1.finance.yahoo.com/v6/finance/quote?symbols=${encodeURIComponent(symbolsParam)}`
  const data = (await client.fetch(quoteUrl)) as YahooQuoteResponse

  const quotes = (data.quoteResponse?.result ?? []).map(toStockQuote)
  return quotes
    .filter((q) => q.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, count)
}

export async function getIndex(name = 'IHSG'): Promise<IndexValue> {
  const indexMap: Record<string, string> = {
    IHSG: '^JKSE',
    LQ45: '^JKLQ45',
    IDX30: '^JKTN',
  }

  const indexSymbol = indexMap[name.toUpperCase()] ?? '^JKSE'
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(indexSymbol)}`
  const data = (await client.fetch(url)) as YahooChartResponse

  if (data.chart?.error) {
    throw new Error(`Yahoo API error: ${JSON.stringify(data.chart.error)}`)
  }

  const meta = data.chart?.result?.[0]?.meta
  if (!meta) {
    throw new Error(`No data found for index: ${name}`)
  }

  const price = meta.regularMarketPrice ?? 0
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? 0
  const change = price - prevClose
  const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

  return {
    name: name.toUpperCase(),
    value: price,
    change,
    changePercent,
  }
}

export async function searchStock(query: string): Promise<SearchResult[]> {
  const q = sanitizeQuery(query)
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=20&newsCount=0&quotesQueryId=tss_match_phrase_query`
  const data = (await client.fetch(url)) as {
    quotes?: Array<{
      symbol?: string
      shortname?: string
      exchange?: string
    }>
  }

  return (data.quotes ?? [])
    .filter((q) => q.symbol?.endsWith('.JK'))
    .map((q) => ({
      symbol: (q.symbol ?? '').replace('.JK', ''),
      name: q.shortname ?? '',
      exchange: q.exchange ?? 'JKT',
    }))
}
