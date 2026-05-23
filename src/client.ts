import type { ClientOptions } from './types.js'

const DEFAULT_OPTIONS: ClientOptions = {
  timeout: 10_000,
  userAgent: 'idx-finance/1.0.0 (https://github.com/sulthonzh/idx-finance)',
}

export class HttpClient {
  private options: ClientOptions
  private lastRequestTime = 0
  private minInterval = 200 // ms between requests (rate limiting)

  constructor(options: Partial<ClientOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  async fetch(url: string): Promise<unknown> {
    // Rate limiting
    const now = Date.now()
    const elapsed = now - this.lastRequestTime
    if (elapsed < this.minInterval) {
      await new Promise((r) => setTimeout(r, this.minInterval - elapsed))
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.options.timeout)

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': this.options.userAgent,
          Accept: 'application/json',
        },
      })
      this.lastRequestTime = Date.now()

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText} — ${url}`)
      }

      return await res.json()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.options.timeout}ms — ${url}`)
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }
}

export const client = new HttpClient()
