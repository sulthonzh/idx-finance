# idx-finance Build Status

## MVP Checklist

### Setup
- [ ] Initialize npm project (package.json, tsconfig.json, vitest.config.ts)
- [ ] Install dev deps (typescript, vitest, commander, chalk, @types/node)
- [ ] Configure dual CJS/ESM exports
- [ ] Set up .gitignore + LICENSE + .env.example

### Core Library
- [ ] types.ts — StockQuote, IndexValue interfaces
- [ ] utils.ts — formatIDR, validateSymbol, formatNumber
- [ ] client.ts — HTTP client with timeout + rate limiting
- [ ] sources/yahoo.ts — Yahoo Finance v8 API wrapper
  - [ ] getQuote(symbol)
  - [ ] getQuotes(symbols[]) — batch
  - [ ] getTopGainers(n)
  - [ ] getTopLosers(n)
  - [ ] getIndex(name)

### CLI
- [ ] cli.ts — Commander.js setup
- [ ] `idx price <symbol>` command
- [ ] `idx gainers [n]` command
- [ ] `idx losers [n]` command
- [ ] `idx index [name]` command
- [ ] `idx search <query>` command
- [ ] Colored output formatting

### Testing
- [ ] utils.test.ts
- [ ] client.test.ts
- [ ] yahoo.test.ts (mocked HTTP)
- [ ] cli.test.ts

### Polish
- [ ] README.md with install + usage + API docs
- [ ] Example output screenshots in README
- [ ] CONTRIBUTING.md

### Security
- [ ] Input validation on all user inputs
- [ ] grep for secrets — clean
- [ ] npm audit — no high/critical

### Publish
- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] Create PUBLIC GitHub repo
- [ ] Push code
- [ ] `npm publish --access public`

## Status: 📋 READY TO BUILD
