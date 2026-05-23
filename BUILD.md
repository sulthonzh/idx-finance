# idx-finance — Build Spec

## Overview
TypeScript library + CLI for Indonesian Stock Exchange (IDX) data.
Zero runtime dependencies. No API key required.

## Package
- **Name:** `idx-finance`
- **License:** MIT
- **Exports:** Dual CJS + ESM
- **Binary:** `idx` (CLI via Commander.js)

## Architecture

```
src/
├── index.ts          — Main exports (library API)
├── cli.ts            — CLI entry point (Commander.js)
├── client.ts         — HTTP client wrapper
├── sources/
│   ├── yahoo.ts      — Yahoo Finance v8 API (prices, quotes)
│   └── idx.ts        — idx.co.id data (indices, sectors)
├── types.ts          — TypeScript interfaces
├── utils.ts          — Helpers (formatting, validation)
└── __tests__/
    ├── client.test.ts
    ├── yahoo.test.ts
    ├── cli.test.ts
    └── utils.test.ts
```

## Data Sources

### Primary: Yahoo Finance v8 API
- `GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}.JK`
  - Stock price, change, volume, history
- `GET https://query1.finance.yahoo.com/v1/finance/trending/ID`
  - Trending stocks
- `GET https://query2.finance.yahoo.com/v6/finance/quote?symbols={symbols}`
  - Batch quotes

### Secondary: idx.co.id
- Stock listing, sector data, index composition
- Use as fallback / supplementary

## Library API

```typescript
import { getQuote, getTopGainers, getTopLosers, getIndex, searchStock } from 'idx-finance'

// Get single stock quote
const quote = await getQuote('BBCA')
// { symbol: 'BBCA', name: 'Bank Central Asia', price: 9725, change: 50, changePercent: 0.52, volume: 15230000, high: 9800, low: 9675, open: 9750, prevClose: 9675 }

// Top gainers
const gainers = await getTopGainers(10)
// [{ symbol: 'X', ... }, ...]

// Top losers
const losers = await getTopLosers(10)

// Index values
const ihsg = await getIndex('IHSG') // or 'LQ45', 'IDX30'

// Search stocks
const results = await searchStock('bank')
```

## CLI

```bash
idx price BBCA        — Show latest price for a stock
idx quote BBCA        — Detailed quote (price, volume, high/low)
idx gainers [n]       — Top n gainers (default 10)
idx losers [n]        — Top n losers (default 10)
idx index [name]      — Index value (IHSG default)
idx search <query>    — Search stocks by name/symbol
```

### CLI Output Format
Colored terminal table. Example:

```
$ idx price BBCA
BBCA (Bank Central Asia Tbk)
Rp 9,725  ▲ +50 (+0.52%)
Vol: 15.2M  H: 9,800  L: 9,675
```

## Types

```typescript
interface StockQuote {
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
  currency: string  // always 'IDR'
}

interface IndexValue {
  name: string
  value: number
  change: number
  changePercent: number
}
```

## Security
- Input validation on all user inputs (symbol, query)
- No eval() or dynamic code execution
- No secrets/API keys needed
- Rate limiting built into HTTP client (respect source APIs)
- User-Agent header set properly
- Timeout on all HTTP requests (10s default)
- Symbol validation: uppercase, alphanumeric only, max 6 chars

## Testing
- Vitest with mocked HTTP responses
- Test each data source independently
- Test CLI commands with mocked data
- Test input validation
- Test error handling (network errors, invalid symbols)
- Coverage target: 70%+

## Files to Generate
1. `package.json` — name, scripts, exports, bin
2. `tsconfig.json` — strict, ESM target
3. `vitest.config.ts` — test config
4. `src/` — all source files
5. `README.md` — install, usage, API docs, examples
6. `LICENSE` — MIT
7. `.gitignore` — node_modules, dist, .env
8. `.env.example` — (empty, no secrets needed)

## Build & Publish
```bash
npm run build    # tsc → dist/
npm test         # vitest
npm publish      # --access public
```
