// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { FinKoreMoneyError, InvalidMoneyAmountError, InvalidMoneyRoundingError, Money } from '../../src/index.js'

describe('Money rate application', () => {
  it('applies decimal and percentage rates exactly while preserving operand value', () => {
    const money = Money.from({ amount: '200.00', currency: 'USD' })

    expect(money.applyRate({ kind: 'DECIMAL', value: '0.075' }).toJSON()).toEqual({
      amount: '15.00000',
      currency: 'USD',
    })
    expect(money.applyRate({ kind: 'PERCENTAGE', value: '7.5' }).toJSON()).toEqual({
      amount: '15.00000',
      currency: 'USD',
    })
    expect(money.toJSON()).toEqual({ amount: '200.00', currency: 'USD' })
  })

  it('accepts zero, negative, and fractional rates with exact base-10 semantics', () => {
    expect(Money.from({ amount: '19.99', currency: 'EUR' }).applyRate({ kind: 'DECIMAL', value: '0' }).toJSON()).toEqual({
      amount: '0.00',
      currency: 'EUR',
    })
    expect(Money.from({ amount: '100.00', currency: 'EUR' }).applyRate({ kind: 'DECIMAL', value: '-0.10' }).toJSON()).toEqual({
      amount: '-10.0000',
      currency: 'EUR',
    })
    expect(Money.from({ amount: '0.10', currency: 'EUR' }).applyRate({ kind: 'DECIMAL', value: '0.20' }).toJSON()).toEqual({
      amount: '0.0200',
      currency: 'EUR',
    })
    expect(Money.from({ amount: '80.00', currency: 'EUR' }).applyRate({ kind: 'PERCENTAGE', value: '12.345' }).toJSON()).toEqual({
      amount: '9.8760000',
      currency: 'EUR',
    })
  })

  it('applies explicit rounding after computing the exact rate product', () => {
    const money = Money.from({ amount: '100.00', currency: 'EUR' })
    const rate = { kind: 'DECIMAL', value: '0.10005' }

    expect(money.applyRate(rate, { rounding: { scale: 2, mode: 'HALF_UP' } }).toJSON()).toEqual({
      amount: '10.01',
      currency: 'EUR',
    })
    expect(money.applyRate(rate, { rounding: { scale: 2, mode: 'HALF_EVEN' } }).toJSON()).toEqual({
      amount: '10.00',
      currency: 'EUR',
    })
    expect(money.toJSON()).toEqual({ amount: '100.00', currency: 'EUR' })
  })

  it('rejects malformed rate values and unsupported representations without mutating the operand', () => {
    const money = Money.from({ amount: '100.00', currency: 'EUR' })
    const callableRate = Object.assign(() => undefined, { kind: 'DECIMAL', value: '0.25' })

    for (const rate of [
      { kind: 'DECIMAL', value: 0.1 },
      { kind: 'PERCENTAGE', value: '1e2' },
      { kind: 'BASIS_POINTS', value: '125' },
      '0.1',
      callableRate,
      [],
      null,
    ]) {
      expect(() => money.applyRate(rate)).toThrow(InvalidMoneyAmountError)
      try {
        money.applyRate(rate)
      } catch (error) {
        expect(error).toBeInstanceOf(FinKoreMoneyError)
        expect((error as FinKoreMoneyError).code).toBe('FINKORE_MONEY_INVALID_AMOUNT')
      }
    }

    expect(money.toJSON()).toEqual({ amount: '100.00', currency: 'EUR' })
  })

  it('rejects invalid explicit rounding without mutating the operand', () => {
    const money = Money.from({ amount: '100.00', currency: 'EUR' })

    expect(() => money.applyRate({ kind: 'DECIMAL', value: '0.105' }, { rounding: { scale: 2, mode: 'HALF_AWAY' } })).toThrow(InvalidMoneyRoundingError)
    try {
      money.applyRate({ kind: 'DECIMAL', value: '0.105' }, { rounding: { scale: 2, mode: 'HALF_AWAY' } })
    } catch (error) {
      expect(error).toBeInstanceOf(FinKoreMoneyError)
      expect((error as FinKoreMoneyError).code).toBe('FINKORE_MONEY_INVALID_ROUNDING')
    }

    for (const options of [null, 'HALF_UP', []]) {
      expect(() => money.applyRate({ kind: 'DECIMAL', value: '0.105' }, options as never)).toThrow(InvalidMoneyRoundingError)
      try {
        money.applyRate({ kind: 'DECIMAL', value: '0.105' }, options as never)
      } catch (error) {
        expect(error).toBeInstanceOf(FinKoreMoneyError)
        expect((error as FinKoreMoneyError).code).toBe('FINKORE_MONEY_INVALID_ROUNDING')
      }
    }

    expect(money.toJSON()).toEqual({ amount: '100.00', currency: 'EUR' })
  })
})
