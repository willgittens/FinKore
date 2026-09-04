import { describe, expect, it } from 'vitest'
import { Currency, InvalidCurrencyError, isValidCurrencyIdentifier } from '../../src/index.js'

describe('Currency', () => {
  it('preserves an uppercase ISO 4217 alphabetic identifier', () => {
    const currency = Currency.of('EUR')

    expect(currency.code).toBe('EUR')
    expect(currency.toString()).toBe('EUR')
    expect(currency.toJSON()).toBe('EUR')
  })

  it('rejects missing, empty, lowercase, and ambiguous identifiers', () => {
    for (const value of [undefined, '', 'eur', 'EURO', 'EU', 978]) {
      expect(() => Currency.of(value)).toThrow(InvalidCurrencyError)
    }
  })

  it('exposes a validation predicate without normalizing candidate identifiers', () => {
    expect(isValidCurrencyIdentifier('EUR')).toBe(true)
    expect(isValidCurrencyIdentifier('eur')).toBe(false)
    expect(isValidCurrencyIdentifier('EURO')).toBe(false)
    expect(isValidCurrencyIdentifier(undefined)).toBe(false)
  })
})
