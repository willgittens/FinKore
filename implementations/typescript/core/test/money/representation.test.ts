// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { Money } from '../../src/index.js'

describe('Money representation', () => {
  it('contains one amount and one currency', () => {
    const money = Money.from({ amount: '1299.90', currency: 'EUR' })

    expect(money.amount).toBe('1299.90')
    expect(money.currency.code).toBe('EUR')
  })

  it('accepts zero and negative values', () => {
    expect(Money.from({ amount: '0', currency: 'EUR' }).toJSON()).toEqual({ amount: '0', currency: 'EUR' })
    expect(Money.from({ amount: '-0.01', currency: 'EUR' }).toJSON()).toEqual({ amount: '-0.01', currency: 'EUR' })
  })
})
