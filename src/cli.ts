import { Command } from 'commander'
import { getQuote, getTopGainers, getTopLosers, getIndex, searchStock } from './sources/yahoo.js'
import { formatIDR, formatNumber, formatPercent } from './utils.js'
import { validateSymbol, validatePositiveInt, sanitizeQuery } from './utils.js'

const program = new Command()
program
  .name('idx')
  .description('Indonesian Stock Exchange (IDX) data from the command line')
  .version('1.0.0')

program
  .command('price')
  .description('Show latest price for a stock')
  .argument('<symbol>', 'Stock symbol (e.g. BBCA)')
  .action(async (symbol: string) => {
    const quote = await getQuote(symbol)
    const arrow = quote.change >= 0 ? '▲' : '▼'
    const colorCode = quote.change >= 0 ? '\x1b[32m' : '\x1b[31m'
    const reset = '\x1b[0m'
    console.log(`\n${quote.symbol} (${quote.name})`)
    console.log(`${formatIDR(quote.price)}  ${colorCode}${arrow} ${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(0)} (${formatPercent(quote.changePercent)})${reset}`)
    console.log(`Vol: ${formatNumber(quote.volume)}  H: ${formatIDR(quote.high)}  L: ${formatIDR(quote.low)}\n`)
  })

program
  .command('quote')
  .description('Detailed quote for a stock')
  .argument('<symbol>', 'Stock symbol')
  .action(async (symbol: string) => {
    const quote = await getQuote(symbol)
    const arrow = quote.change >= 0 ? '▲' : '▼'
    const colorCode = quote.change >= 0 ? '\x1b[32m' : '\x1b[31m'
    const reset = '\x1b[0m'
    console.log(`\n${quote.symbol} (${quote.name})`)
    console.log(`Price:    ${formatIDR(quote.price)}`)
    console.log(`Change:   ${colorCode}${arrow} ${quote.change.toFixed(0)} (${formatPercent(quote.changePercent)})${reset}`)
    console.log(`Open:     ${formatIDR(quote.open)}`)
    console.log(`High:     ${formatIDR(quote.high)}`)
    console.log(`Low:      ${formatIDR(quote.low)}`)
    console.log(`Prev:     ${formatIDR(quote.prevClose)}`)
    console.log(`Volume:   ${formatNumber(quote.volume)}`)
    if (quote.marketCap) console.log(`MktCap:   ${formatNumber(quote.marketCap)}`)
    console.log()
  })

program
  .command('gainers')
  .description('Top gaining stocks')
  .argument('[n]', 'Number of stocks', '10')
  .action(async (n: string) => {
    const count = validatePositiveInt(parseInt(n, 10) || 10, 50)
    const gainers = await getTopGainers(count)
    if (gainers.length === 0) {
      console.log('No gainers data available.')
      return
    }
    console.log(`\n\x1b[1mTop ${gainers.length} Gainers\x1b[0m\n`)
    for (const q of gainers) {
      const color = '\x1b[32m'
      const reset = '\x1b[0m'
      console.log(`  ${q.symbol.padEnd(6)} ${formatIDR(q.price).padStart(14)}  ${color}${formatPercent(q.changePercent).padStart(9)}${reset}  ${q.name}`)
    }
    console.log()
  })

program
  .command('losers')
  .description('Top losing stocks')
  .argument('[n]', 'Number of stocks', '10')
  .action(async (n: string) => {
    const count = validatePositiveInt(parseInt(n, 10) || 10, 50)
    const losers = await getTopLosers(count)
    if (losers.length === 0) {
      console.log('No losers data available.')
      return
    }
    console.log(`\n\x1b[1mTop ${losers.length} Losers\x1b[0m\n`)
    for (const q of losers) {
      const color = '\x1b[31m'
      const reset = '\x1b[0m'
      console.log(`  ${q.symbol.padEnd(6)} ${formatIDR(q.price).padStart(14)}  ${color}${formatPercent(q.changePercent).padStart(9)}${reset}  ${q.name}`)
    }
    console.log()
  })

program
  .command('index')
  .description('Show index value (IHSG, LQ45, IDX30)')
  .argument('[name]', 'Index name', 'IHSG')
  .action(async (name: string) => {
    const idx = await getIndex(name)
    const arrow = idx.change >= 0 ? '▲' : '▼'
    const colorCode = idx.change >= 0 ? '\x1b[32m' : '\x1b[31m'
    const reset = '\x1b[0m'
    console.log(`\n${idx.name}`)
    console.log(`${idx.value.toLocaleString('id-ID')}  ${colorCode}${arrow} ${idx.change.toFixed(2)} (${formatPercent(idx.changePercent)})${reset}\n`)
  })

program
  .command('search')
  .description('Search stocks by name or symbol')
  .argument('<query>', 'Search query')
  .action(async (query: string) => {
    sanitizeQuery(query)
    const results = await searchStock(query)
    if (results.length === 0) {
      console.log('No results found.')
      return
    }
    console.log(`\n\x1b[1mSearch: "${query}" (${results.length} results)\x1b[0m\n`)
    for (const r of results) {
      console.log(`  ${r.symbol.padEnd(6)}  ${r.name}`)
    }
    console.log()
  })

program.parse()
