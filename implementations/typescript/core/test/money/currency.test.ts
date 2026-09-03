import { describe, expect, it } from 'vitest'
import { Currency, InvalidCurrencyError } from '../../src/index.js'

describe('Currency', () => {
  it('preserves an uppercase ISO 4217 alphabetic identifier', () => {
    expect(Currency.of('EUR').code).toBe('EUR')
  })

  it('rejects missing, empty, lowercase, and ambiguous identifiers', () => {
    for (const value of [undefined, '', 'eur', 'EURO', 'EU', 978]) {
      expect(() => Currency.of(value)).toThrow(InvalidCurrencyError)
    }
  })
})
