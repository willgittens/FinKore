// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { InvalidMoneyAmountError, Money } from '../../src/index.js'

describe('Money serialization', () => {
  it('serializes locale-independent decimal strings', () => {
    expect(Money.from({ amount: '1299.90', currency: 'EUR' }).toJSON()).toEqual({
      amount: '1299.90',
      currency: 'EUR',
    })
  })

  it('preserves presentation scale through the Core 0.9 serialization path', () => {
    expect(Money.deserialize({ amount: '15.50', currency: 'EUR' }).toJSON()).toEqual({
      amount: '15.50',
      currency: 'EUR',
    })
  })

  it('ignores unknown members without altering amount or currency meaning', () => {
    expect(Money.deserialize({ amount: '10.00', currency: 'EUR', display: '10,00 EUR' }).toJSON()).toEqual({
      amount: '10.00',
      currency: 'EUR',
    })
  })

  it('rejects non-object portable Money values', () => {
    expect(() => Money.deserialize(undefined)).toThrow(InvalidMoneyAmountError)
    expect(() => Money.deserialize(null)).toThrow(InvalidMoneyAmountError)
  })
})
