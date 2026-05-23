import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getQuote, getQuotes, getTopGainers, getTopLosers, getIndex, searchStock } from '../sources/yahoo.js'

// Mock the client module
vi.mock('../client.js', () => ({
  client: {
    fetch: vi.fn(),
  },
}))

import { client } from '../client.js'
const mockedFetch = vi.mocked(client.fetch)

const mockQuoteResponse = {
  quoteResponse: {
    result: [
      {
        symbol: 'BBCA.JK',
        shortName: 'Bank Central Asia Tbk',
        regularMarketPrice: 9725,
        regularMarketChange: 50,
        regularMarketChangePercent: 0.52,
        regularMarketVolume: 15230000,
        regularMarketDayHigh: 9800,
        regularMarketDayLow: 9675,
        regularMarketOpen: 9750,
        regularMarketPreviousClose: 9675,
        marketCap: 119000000000000,
        currency: 'IDR',
      },
    ],
  },
}

const mockChartResponse = {
  chart: {
    result: [
      {
        meta: {
          regularMarketPrice: 7200.5,
          previousClose: 7150.0,
          chartPreviousClose: 7150.0,
          currency: 'IDR',
          shortName: 'Composite',
          symbol: '^JKSE',
        },
      },
    ],
  },
}

const mockTrendingResponse = {
  finance: {
    result: [
      {
        quotes: [
          { symbol: 'BBCA.JK' },
          { symbol: 'TLKM.JK' },
          { symbol: 'ASII.JK' },
        ],
      },
    ],
  },
}

const mockSearchResponse = {
  quotes: [
    { symbol: 'BBCA.JK', shortname: 'Bank Central Asia', exchange: 'JKT' },
    { symbol: 'BBNI.JK', shortname: 'Bank Negara Indonesia', exchange: 'JKT' },
  ],
}

describe('Yahoo Finance API', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('getQuote', () => {
    it('returns a formatted stock quote', async () => {
      mockedFetch.mockResolvedValueOnce(mockQuoteResponse)
      const quote = await getQuote('BBCA')

      expect(quote.symbol).toBe('BBCA')
      expect(quote.name).toBe('Bank Central Asia Tbk')
      expect(quote.price).toBe(9725)
      expect(quote.change).toBe(50)
      expect(quote.changePercent).toBe(0.52)
    })

    it('rejects invalid symbols', async () => {
      await expect(getQuote('INVALID-SYM')).rejects.toThrow('Invalid symbol')
    })

    it('throws when no data found', async () => {
      mockedFetch.mockResolvedValueOnce({ quoteResponse: { result: [] } })
      await expect(getQuote('ZZZZZ')).rejects.toThrow('No data found')
    })
  })

  describe('getQuotes', () => {
    it('returns multiple quotes', async () => {
      mockedFetch.mockResolvedValueOnce({
        quoteResponse: {
          result: [
            mockQuoteResponse.quoteResponse.result[0],
            { ...mockQuoteResponse.quoteResponse.result[0], symbol: 'TLKM.JK', shortName: 'Telkom' },
          ],
        },
      })
      const quotes = await getQuotes(['BBCA', 'TLKM'])
      expect(quotes).toHaveLength(2)
      expect(quotes[0].symbol).toBe('BBCA')
      expect(quotes[1].symbol).toBe('TLKM')
    })

    it('rejects more than 50 symbols', async () => {
      await expect(getQuotes(Array(51).fill('BBCA'))).rejects.toThrow('Maximum 50')
    })

    it('returns empty for empty array', async () => {
      const quotes = await getQuotes([])
      expect(quotes).toHaveLength(0)
    })
  })

  describe('getIndex', () => {
    it('returns index value for IHSG', async () => {
      mockedFetch.mockResolvedValueOnce(mockChartResponse)
      const idx = await getIndex('IHSG')

      expect(idx.name).toBe('IHSG')
      expect(idx.value).toBe(7200.5)
      expect(idx.change).toBeCloseTo(50.5)
      expect(idx.changePercent).toBeCloseTo(0.7063, 3)
    })

    it('defaults to IHSG when no name given', async () => {
      mockedFetch.mockResolvedValueOnce(mockChartResponse)
      const idx = await getIndex()
      expect(idx.name).toBe('IHSG')
    })
  })

  describe('searchStock', () => {
    it('returns matching stocks', async () => {
      mockedFetch.mockResolvedValueOnce(mockSearchResponse)
      const results = await searchStock('bank')
      expect(results).toHaveLength(2)
      expect(results[0].symbol).toBe('BBCA')
    })

    it('rejects empty queries', async () => {
      await expect(searchStock('')).rejects.toThrow('empty')
    })
  })

  describe('getTopGainers', () => {
    it('returns sorted gainers from trending', async () => {
      // First call: trending
      mockedFetch.mockResolvedValueOnce(mockTrendingResponse)
      // Second call: quotes
      mockedFetch.mockResolvedValueOnce({
        quoteResponse: {
          result: [
            { symbol: 'BBCA.JK', shortName: 'BCA', regularMarketPrice: 9725, regularMarketChange: 50, regularMarketChangePercent: 0.52, regularMarketVolume: 1000, regularMarketDayHigh: 9800, regularMarketDayLow: 9675, regularMarketOpen: 9750, regularMarketPreviousClose: 9675, currency: 'IDR' },
            { symbol: 'TLKM.JK', shortName: 'Telkom', regularMarketPrice: 3500, regularMarketChange: -20, regularMarketChangePercent: -0.57, regularMarketVolume: 5000, regularMarketDayHigh: 3550, regularMarketDayLow: 3480, regularMarketOpen: 3540, regularMarketPreviousClose: 3520, currency: 'IDR' },
            { symbol: 'ASII.JK', shortName: 'Astra', regularMarketPrice: 5200, regularMarketChange: 100, regularMarketChangePercent: 1.96, regularMarketVolume: 8000, regularMarketDayHigh: 5250, regularMarketDayLow: 5100, regularMarketOpen: 5120, regularMarketPreviousClose: 5100, currency: 'IDR' },
          ],
        },
      })

      const gainers = await getTopGainers(5)
      expect(gainers).toHaveLength(2) // Only positive ones
      expect(gainers[0].symbol).toBe('ASII') // Highest % gain
    })
  })
})
