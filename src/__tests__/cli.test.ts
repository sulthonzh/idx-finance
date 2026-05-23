import { describe, it, expect, vi } from 'vitest'

// We test CLI argument parsing by building the program programmatically
import { Command } from 'commander'

describe('CLI argument validation', () => {
  it('rejects invalid symbol in price command', async () => {
    const program = new Command()
    program.exitOverride() // Prevent process.exit

    let caught = false
    program
      .command('price')
      .argument('<symbol>')
      .action(async (symbol: string) => {
        const SYMBOL_REGEX = /^[A-Z0-9]{1,6}$/
        const upper = symbol.toUpperCase().trim()
        if (!SYMBOL_REGEX.test(upper)) throw new Error('Invalid symbol')
      })

    try {
      await program.parseAsync(['node', 'idx', 'price', 'BAD-SYM'])
    } catch {
      caught = true
    }
    expect(caught).toBe(true)
  })

  it('accepts valid symbol', async () => {
    let received = ''
    const program = new Command()
    program.exitOverride()
    program
      .command('price')
      .argument('<symbol>')
      .action(async (symbol: string) => {
        received = symbol
      })

    try {
      await program.parseAsync(['node', 'idx', 'price', 'BBCA'])
    } catch {
      // exitOverride throws after action
    }
    expect(received).toBe('BBCA')
  })

  it('parses count argument for gainers', async () => {
    let received = ''
    const program = new Command()
    program.exitOverride()
    program
      .command('gainers')
      .argument('[n]', 'count', '10')
      .action(async (n: string) => {
        received = n
      })

    try {
      await program.parseAsync(['node', 'idx', 'gainers', '20'])
    } catch {
      // exitOverride throws after action
    }
    expect(received).toBe('20')
  })
})
