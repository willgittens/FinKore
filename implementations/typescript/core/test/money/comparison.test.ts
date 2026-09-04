import { describe, expect, it } from 'vitest'
import { CurrencyMismatchError, FinKoreMoneyError, Money } from '../../src/index.js'

describe('Money comparison', () => {
  it('treats numerically equal decimal representations as equal', () => {
    expect(
      Money.from({ amount: '10.0', currency: 'EUR' }).compare(Money.from({ amount: '10.00', currency: 'EUR' })),
    ).toBe('EQUAL')

    expect(Money.from({ amount: '0', currency: 'EUR' }).compare(Money.from({ amount: '0.000', currency: 'EUR' }))).toBe(
      'EQUAL',
    )
  })

  it('is reflexive for compatible Money values without mutating the operand', () => {
    const money = Money.from({ amount: '-123.4500', currency: 'EUR' })

    expect(money.compare(money)).toBe('EQUAL')
    expect(money.toJSON()).toEqual({ amount: '-123.4500', currency: 'EUR' })
  })

  it('orders strict less-than and greater-than amounts without treating equality as ordered', () => {
    const lower = Money.from({ amount: '10.00', currency: 'EUR' })
    const higher = Money.from({ amount: '10.01', currency: 'EUR' })
    const equal = Money.from({ amount: '10.00', currency: 'EUR' })

    expect(lower.compare(higher)).toBe('LESS')
    expect(higher.compare(lower)).toBe('GREATER')
    expect(lower.compare(equal)).toBe('EQUAL')
  })

  it('orders negative values by ordinary exact numeric meaning', () => {
    expect(Money.from({ amount: '-10.00', currency: 'EUR' }).compare(Money.from({ amount: '-9.99', currency: 'EUR' }))).toBe(
      'LESS',
    )

    expect(Money.from({ amount: '-1.00', currency: 'EUR' }).compare(Money.from({ amount: '-2.00', currency: 'EUR' }))).toBe(
      'GREATER',
    )
  })

  it('compares very small decimal differences exactly without binary floating-point approximation', () => {
    expect(
      Money.from({ amount: '0.00000000000000000001', currency: 'EUR' }).compare(
        Money.from({ amount: '0.00000000000000000002', currency: 'EUR' }),
      ),
    ).toBe('LESS')
  })

  it('compares very large exact decimal values without losing precision', () => {
    expect(
      Money.from({ amount: '999999999999999999999999999999.99', currency: 'EUR' }).compare(
        Money.from({ amount: '1000000000000000000000000000000.00', currency: 'EUR' }),
      ),
    ).toBe('LESS')
  })

  it('rejects incompatible currencies before returning equality or ordering and preserves operands', () => {
    const left = Money.from({ amount: '10.00', currency: 'EUR' })
    const equalDigits = Money.from({ amount: '10.00', currency: 'USD' })
    const differentDigits = Money.from({ amount: '2.00', currency: 'USD' })

    for (const other of [equalDigits, differentDigits]) {
      expect(() => left.compare(other)).toThrow(CurrencyMismatchError)
      try {
        left.compare(other)
      } catch (error) {
        expect(error).toBeInstanceOf(FinKoreMoneyError)
        expect((error as FinKoreMoneyError).code).toBe('FINKORE_MONEY_CURRENCY_MISMATCH')
      }
    }

    expect(left.toJSON()).toEqual({ amount: '10.00', currency: 'EUR' })
    expect(equalDigits.toJSON()).toEqual({ amount: '10.00', currency: 'USD' })
    expect(differentDigits.toJSON()).toEqual({ amount: '2.00', currency: 'USD' })
  })
})
