import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpClient } from '../client.js'

describe('HttpClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('makes a fetch request with correct headers', async () => {
    const mockJson = { data: 'test' }
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJson),
    })
    vi.stubGlobal('fetch', mockFetch)

    const http = new HttpClient({ timeout: 5000 })
    const result = await http.fetch('https://example.com/api')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('idx-finance'),
        }),
      })
    )
    expect(result).toEqual(mockJson)
  })

  it('throws on HTTP error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })
    vi.stubGlobal('fetch', mockFetch)

    const http = new HttpClient()
    await expect(http.fetch('https://example.com/bad')).rejects.toThrow('HTTP 404')
  })

  it('throws on timeout', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'))
    vi.stubGlobal('fetch', mockFetch)

    const http = new HttpClient({ timeout: 1 })
    await expect(http.fetch('https://example.com/slow')).rejects.toThrow('timeout')
  })

  it('respects custom user agent', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    vi.stubGlobal('fetch', mockFetch)

    const http = new HttpClient({ userAgent: 'custom/1.0' })
    await http.fetch('https://example.com')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': 'custom/1.0',
        }),
      })
    )
  })
})
