// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { FinKoreMoneyError, InvalidMoneyRoundingError, Money } from '../../src/index.js'
import type { MoneyRoundOptions, RoundingMode } from '../../src/index.js'

function rounded(amount: string, scale: number, mode: RoundingMode): string {
  return Money.from({ amount, currency: 'EUR' }).round({ scale, mode }).toJSON().amount
}

describe('Money rounding', () => {
  it('requires an explicit target scale and supported FinKore rounding mode', () => {
    const money = Money.from({ amount: '1.235', currency: 'EUR' })
    const invalidOptions: MoneyRoundOptions[] = [
      { scale: -1, mode: 'HALF_UP' },
      { scale: 1.5, mode: 'HALF_UP' },
      { scale: '2', mode: 'HALF_UP' },
      { scale: Number.MAX_SAFE_INTEGER + 1, mode: 'HALF_UP' },
      { scale: 2, mode: 'HALF_DOWN' },
      { scale: 2, mode: 1 },
      { scale: 2, mode: undefined },
    ]

    for (const options of invalidOptions) {
      expect(() => money.round(options)).toThrow(InvalidMoneyRoundingError)
      try {
        money.round(options)
      } catch (error) {
        expect(error).toBeInstanceOf(FinKoreMoneyError)
        expect((error as FinKoreMoneyError).code).toBe('FINKORE_MONEY_INVALID_ROUNDING')
      }
    }

    expect(() => money.round(undefined as unknown as MoneyRoundOptions)).toThrow(InvalidMoneyRoundingError)
    expect(() => money.round(null as unknown as MoneyRoundOptions)).toThrow(InvalidMoneyRoundingError)
    expect(money.toJSON()).toEqual({ amount: '1.235', currency: 'EUR' })
  })

  it('rounds HALF_UP ties and nearby non-ties without binary floating-point arithmetic', () => {
    expect(rounded('10.0049', 2, 'HALF_UP')).toBe('10.00')
    expect(rounded('10.005', 2, 'HALF_UP')).toBe('10.01')
    expect(rounded('10.0051', 2, 'HALF_UP')).toBe('10.01')
    expect(rounded('-10.0049', 2, 'HALF_UP')).toBe('-10.00')
    expect(rounded('-10.005', 2, 'HALF_UP')).toBe('-10.01')
    expect(rounded('-10.0051', 2, 'HALF_UP')).toBe('-10.01')
  })

  it('rounds HALF_EVEN ties according to the retained digit parity', () => {
    expect(rounded('10.0051', 2, 'HALF_EVEN')).toBe('10.01')
    expect(rounded('10.005', 2, 'HALF_EVEN')).toBe('10.00')
    expect(rounded('10.0049', 2, 'HALF_EVEN')).toBe('10.00')
    expect(rounded('10.0149', 2, 'HALF_EVEN')).toBe('10.01')
    expect(rounded('10.015', 2, 'HALF_EVEN')).toBe('10.02')
    expect(rounded('10.025', 2, 'HALF_EVEN')).toBe('10.02')
    expect(rounded('-10.0051', 2, 'HALF_EVEN')).toBe('-10.01')
    expect(rounded('-10.005', 2, 'HALF_EVEN')).toBe('-10.00')
    expect(rounded('-10.0049', 2, 'HALF_EVEN')).toBe('-10.00')
    expect(rounded('-10.0149', 2, 'HALF_EVEN')).toBe('-10.01')
    expect(rounded('-10.015', 2, 'HALF_EVEN')).toBe('-10.02')
  })

  it('distinguishes DOWN, UP, FLOOR, and CEILING for positive and negative values', () => {
    expect(rounded('1.239', 2, 'DOWN')).toBe('1.23')
    expect(rounded('-1.239', 2, 'DOWN')).toBe('-1.23')
    expect(rounded('1.231', 2, 'UP')).toBe('1.24')
    expect(rounded('-1.231', 2, 'UP')).toBe('-1.24')
    expect(rounded('1.239', 2, 'FLOOR')).toBe('1.23')
    expect(rounded('-1.231', 2, 'FLOOR')).toBe('-1.24')
    expect(rounded('1.231', 2, 'CEILING')).toBe('1.24')
    expect(rounded('-1.239', 2, 'CEILING')).toBe('-1.23')
  })

  it('uses the explicit target scale without substituting currency minor units', () => {
    expect(rounded('1.2345', 3, 'HALF_UP')).toBe('1.235')
    expect(rounded('1.2345', 0, 'HALF_UP')).toBe('1')
  })

  it('preserves currency and does not mutate the operand', () => {
    const money = Money.from({ amount: '10.005', currency: 'EUR' })

    const result = money.round({ scale: 2, mode: 'HALF_UP' })

    expect(result.toJSON()).toEqual({ amount: '10.01', currency: 'EUR' })
    expect(money.toJSON()).toEqual({ amount: '10.005', currency: 'EUR' })
  })

  it('preserves numeric value when no digits are discarded and pads when increasing scale', () => {
    expect(rounded('1.23', 2, 'UP')).toBe('1.23')
    expect(rounded('1.230', 2, 'FLOOR')).toBe('1.23')
    expect(rounded('1.230', 2, 'UP')).toBe('1.23')
    expect(rounded('-1.230', 2, 'FLOOR')).toBe('-1.23')
    expect(rounded('10.5', 3, 'CEILING')).toBe('10.500')
    expect(rounded('0', 2, 'UP')).toBe('0.00')
    expect(rounded('-0.004', 2, 'DOWN')).toBe('0.00')
    expect(rounded('-0.004', 2, 'UP')).toBe('-0.01')
    expect(rounded('0.001', 2, 'FLOOR')).toBe('0.00')
    expect(rounded('-0.001', 2, 'CEILING')).toBe('0.00')
  })

  it('rounds very large and very small decimal values exactly', () => {
    expect(rounded('900719925474099312345.555', 2, 'HALF_UP')).toBe('900719925474099312345.56')
    expect(rounded('0.0005', 3, 'HALF_EVEN')).toBe('0.000')
    expect(rounded('0.0015', 3, 'HALF_EVEN')).toBe('0.002')
  })
})
