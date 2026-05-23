import { client } from '../client.js'
import type { SearchResult } from '../types.js'
import { sanitizeQuery } from '../utils.js'

interface IDXStock {
  symbol: string
  name: string
  sector?: string
}

let stockListCache: IDXStock[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getStockList(): Promise<SearchResult[]> {
  const now = Date.now()
  if (stockListCache && now - cacheTimestamp < CACHE_TTL) {
    return stockListCache.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      exchange: 'JKT',
    }))
  }

  try {
    const url = 'https://www.idx.co.id/primary/ListedCompany/GetListedCompanyJson'
    const data = (await client.fetch(url)) as Array<{
      KodeEmiten?: string
      NamaEmiten?: string
      Sektor?: string
    }>

    stockListCache = (Array.isArray(data) ? data : []).map((item) => ({
      symbol: (item.KodeEmiten ?? '').trim().toUpperCase(),
      name: (item.NamaEmiten ?? '').trim(),
      sector: item.Sektor,
    }))
    cacheTimestamp = Date.now()

    return stockListCache.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      exchange: 'JKT',
    }))
  } catch {
    // idx.co.id is often flaky, return empty
    return []
  }
}

export async function searchStockIDX(query: string): Promise<SearchResult[]> {
  const q = sanitizeQuery(query).toLowerCase()
  const stocks = await getStockList()
  return stocks.filter(
    (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  )
}
