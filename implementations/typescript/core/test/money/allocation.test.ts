// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  FinKoreMoneyError,
  InvalidMoneyAllocationError,
  Money,
  MoneyRoundingRequiredError,
} from '../../src/index.js'

function json(results: readonly Money[]) {
  return results.map((money) => money.toJSON())
}

describe('Money allocation', () => {
  it('allocates equal positive parts at an explicit scale with ordered remainder placement', () => {
    const money = Money.from({ amount: '10.00', currency: 'USD' })

    expect(json(money.allocate({ method: 'EQUAL', parts: 3, scale: 2 }))).toEqual([
      { amount: '3.34', currency: 'USD' },
      { amount: '3.33', currency: 'USD' },
      { amount: '3.33', currency: 'USD' },
    ])
    expect(money.toJSON()).toEqual({ amount: '10.00', currency: 'USD' })
  })

  it('allocates positive integer ratios without dropping or duplicating remainder units', () => {
    const money = Money.from({ amount: '10.00', currency: 'USD' })

    expect(json(money.allocate({ method: 'RATIO', ratios: [1, 2, 3], scale: 2 }))).toEqual([
      { amount: '1.67', currency: 'USD' },
      { amount: '3.33', currency: 'USD' },
      { amount: '5.00', currency: 'USD' },
    ])
    expect(money.toJSON()).toEqual({ amount: '10.00', currency: 'USD' })
  })

  it('preserves zero and negative source semantics', () => {
    expect(json(Money.from({ amount: '0.00', currency: 'EUR' }).allocate({ method: 'RATIO', ratios: [1, 2], scale: 2 }))).toEqual([
      { amount: '0.00', currency: 'EUR' },
      { amount: '0.00', currency: 'EUR' },
    ])

    const negative = Money.from({ amount: '-10.00', currency: 'USD' })
    expect(json(negative.allocate({ method: 'EQUAL', parts: 3, scale: 2 }))).toEqual([
      { amount: '-3.34', currency: 'USD' },
      { amount: '-3.33', currency: 'USD' },
      { amount: '-3.33', currency: 'USD' },
    ])
    expect(negative.toJSON()).toEqual({ amount: '-10.00', currency: 'USD' })
  })

  it('preserves declared ratio order and supports large integer ratios', () => {
    expect(json(Money.from({ amount: '10.00', currency: 'USD' }).allocate({ method: 'RATIO', ratios: [3, 2, 1], scale: 2 }))).toEqual([
      { amount: '5.01', currency: 'USD' },
      { amount: '3.33', currency: 'USD' },
      { amount: '1.66', currency: 'USD' },
    ])

    expect(
      json(
        Money.from({ amount: '100.00', currency: 'EUR' }).allocate({
          method: 'RATIO',
          ratios: [4000000000000, 6000000000000],
          scale: 2,
        }),
      ),
    ).toEqual([
      { amount: '40.00', currency: 'EUR' },
      { amount: '60.00', currency: 'EUR' },
    ])
  })

  it('rejects source amounts that are unrepresentable at the requested scale without mutating the operand', () => {
    const money = Money.from({ amount: '10.001', currency: 'USD' })

    expect(() => money.allocate({ method: 'EQUAL', parts: 2, scale: 2 })).toThrow(MoneyRoundingRequiredError)
    try {
      money.allocate({ method: 'EQUAL', parts: 2, scale: 2 })
    } catch (error) {
      expect(error).toBeInstanceOf(FinKoreMoneyError)
      expect((error as FinKoreMoneyError).code).toBe('FINKORE_MONEY_ROUNDING_REQUIRED')
    }
    expect(money.toJSON()).toEqual({ amount: '10.001', currency: 'USD' })
  })

  it('rejects invalid allocation methods, part counts, ratios, and target scales without mutating the operand', () => {
    const money = Money.from({ amount: '10.00', currency: 'USD' })

    for (const request of [
      { method: 'EQUAL', parts: 0, scale: 2 },
      { method: 'EQUAL', parts: -1, scale: 2 },
      { method: 'EQUAL', parts: 1.5, scale: 2 },
      { method: 'EQUAL', scale: 2 },
      { method: 'EQUAL', parts: 2, ratios: [1, 1], scale: 2 },
      { method: 'RATIO', ratios: [], scale: 2 },
      { method: 'RATIO', ratios: [1, 0, 2], scale: 2 },
      { method: 'RATIO', ratios: [1, -2], scale: 2 },
      { method: 'RATIO', ratios: [1, '2'], scale: 2 },
      { method: 'RATIO', ratios: [1, 1.5], scale: 2 },
      { method: 'RATIO', ratios: [1, 2], parts: 2, scale: 2 },
      { method: 'RATIO', scale: 2 },
      { method: 'WEIGHTED', ratios: [1, 2], scale: 2 },
      { method: 'EQUAL', parts: 2, scale: 2.5 },
      { method: 'EQUAL', parts: 2, scale: -1 },
      { method: 'EQUAL', parts: 2 },
      null,
      [],
    ]) {
      expect(() => money.allocate(request as never)).toThrow(InvalidMoneyAllocationError)
      try {
        money.allocate(request as never)
      } catch (error) {
        expect(error).toBeInstanceOf(FinKoreMoneyError)
        expect((error as FinKoreMoneyError).code).toBe('FINKORE_MONEY_INVALID_ALLOCATION')
      }
    }

    expect(money.toJSON()).toEqual({ amount: '10.00', currency: 'USD' })
  })
})
