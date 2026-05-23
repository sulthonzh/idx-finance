import { describe, it, expect } from 'vitest'
import {
  validateSymbol,
  validatePositiveInt,
  formatIDR,
  formatNumber,
  formatPercent,
  sanitizeQuery,
} from '../utils.js'

describe('validateSymbol', () => {
  it('accepts valid symbols', () => {
    expect(validateSymbol('BBCA')).toBe('BBCA')
    expect(validateSymbol('tlkm')).toBe('TLKM')
    expect(validateSymbol('  asii  ')).toBe('ASII')
  })

  it('rejects invalid symbols', () => {
    expect(() => validateSymbol('')).toThrow('Invalid symbol')
    expect(() => validateSymbol('ABCDEFG')).toThrow('Invalid symbol')
    expect(() => validateSymbol('BB-C')).toThrow('Invalid symbol')
    expect(() => validateSymbol('BBC A')).toThrow('Invalid symbol')
  })
})

describe('validatePositiveInt', () => {
  it('accepts valid positive integers', () => {
    expect(validatePositiveInt(1)).toBe(1)
    expect(validatePositiveInt(10)).toBe(10)
    expect(validatePositiveInt(50, 50)).toBe(50)
  })

  it('rejects invalid values', () => {
    expect(() => validatePositiveInt(0)).toThrow('Invalid value')
    expect(() => validatePositiveInt(-1)).toThrow('Invalid value')
    expect(() => validatePositiveInt(1.5)).toThrow('Invalid value')
    expect(() => validatePositiveInt(51, 50)).toThrow('Invalid value')
  })
})

describe('formatIDR', () => {
  it('formats numbers as IDR', () => {
    expect(formatIDR(9725)).toBe('Rp 9.725')
    expect(formatIDR(1000000)).toBe('Rp 1.000.000')
  })
})

describe('formatNumber', () => {
  it('formats billions', () => {
    expect(formatNumber(1_500_000_000)).toBe('1.5B')
  })

  it('formats millions', () => {
    expect(formatNumber(15_200_000)).toBe('15.2M')
  })

  it('formats thousands', () => {
    expect(formatNumber(5_200)).toBe('5.2K')
  })

  it('formats small numbers', () => {
    expect(formatNumber(500)).toBe('500')
  })
})

describe('formatPercent', () => {
  it('formats positive with plus sign', () => {
    expect(formatPercent(0.52)).toBe('+0.52%')
  })

  it('formats negative without plus', () => {
    expect(formatPercent(-1.23)).toBe('-1.23%')
  })

  it('formats zero with plus', () => {
    expect(formatPercent(0)).toBe('+0.00%')
  })
})

describe('sanitizeQuery', () => {
  it('accepts valid queries', () => {
    expect(sanitizeQuery('bank')).toBe('bank')
    expect(sanitizeQuery('  bca  ')).toBe('bca')
  })

  it('rejects empty query', () => {
    expect(() => sanitizeQuery('')).toThrow('empty')
    expect(() => sanitizeQuery('   ')).toThrow('empty')
  })

  it('rejects too long query', () => {
    expect(() => sanitizeQuery('a'.repeat(101))).toThrow('too long')
  })
})
