// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  CurrencyMismatchError,
  FinKoreMoneyError,
  InvalidCurrencyError,
  InvalidMoneyAllocationError,
  InvalidMoneyAmountError,
  InvalidMoneyRoundingError,
  Money,
  MoneyDivisionByZeroError,
  MoneyRoundingRequiredError,
  isFinKoreMoneyError,
} from '../../src/index.js'

describe('Money errors', () => {
  it('exposes portable invalid amount errors', () => {
    for (const amount of [undefined, 1299.9, '1e3', '+1.00', 'NaN', 'Infinity', '']) {
      expect(() => Money.from({ amount, currency: 'EUR' })).toThrow(InvalidMoneyAmountError)
      try {
        Money.from({ amount, currency: 'EUR' })
      } catch (error) {
        expect(error).toBeInstanceOf(FinKoreMoneyError)
        expect((error as FinKoreMoneyError).code).toBe('FINKORE_MONEY_INVALID_AMOUNT')
      }
    }
  })

  it('exposes portable invalid currency errors', () => {
    for (const currency of [undefined, '', 'eur', 978]) {
      expect(() => Money.from({ amount: '10.00', currency })).toThrow(InvalidCurrencyError)
      try {
        Money.from({ amount: '10.00', currency })
      } catch (error) {
        expect(error).toBeInstanceOf(FinKoreMoneyError)
        expect((error as FinKoreMoneyError).code).toBe('FINKORE_MONEY_INVALID_CURRENCY')
      }
    }
  })

  it('exposes every currently specified portable Money code', () => {
    expect(new InvalidMoneyAmountError().code).toBe('FINKORE_MONEY_INVALID_AMOUNT')
    expect(new InvalidCurrencyError().code).toBe('FINKORE_MONEY_INVALID_CURRENCY')
    expect(new CurrencyMismatchError().code).toBe('FINKORE_MONEY_CURRENCY_MISMATCH')
    expect(new MoneyDivisionByZeroError().code).toBe('FINKORE_MONEY_DIVISION_BY_ZERO')
    expect(new MoneyRoundingRequiredError().code).toBe('FINKORE_MONEY_ROUNDING_REQUIRED')
    expect(new InvalidMoneyRoundingError().code).toBe('FINKORE_MONEY_INVALID_ROUNDING')
    expect(new InvalidMoneyAllocationError().code).toBe('FINKORE_MONEY_INVALID_ALLOCATION')
  })

  it('narrows FinKore Money errors without relying on messages', () => {
    expect(isFinKoreMoneyError(new InvalidMoneyAmountError())).toBe(true)
    expect(isFinKoreMoneyError(new Error('Invalid Money amount'))).toBe(false)
  })
})
