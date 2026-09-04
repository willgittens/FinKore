import { describe, expect, it } from 'vitest'
import {
  CurrencyMismatchError,
  FinFlowMoneyError,
  Money,
  MoneyDivisionByZeroError,
  MoneyRoundingRequiredError,
} from '../../src/index.js'

describe('Money arithmetic', () => {
  it('adds compatible currencies exactly and preserves operand values', () => {
    const left = Money.from({ amount: '10.20', currency: 'EUR' })
    const right = Money.from({ amount: '5.30', currency: 'EUR' })

    const sum = left.add(right)

    expect(sum.toJSON()).toEqual({ amount: '15.50', currency: 'EUR' })
    expect(left.toJSON()).toEqual({ amount: '10.20', currency: 'EUR' })
    expect(right.toJSON()).toEqual({ amount: '5.30', currency: 'EUR' })
  })

  it('does not leak binary floating-point arithmetic', () => {
    const left = Money.from({ amount: '0.1', currency: 'EUR' })
    const right = Money.from({ amount: '0.2', currency: 'EUR' })

    expect(left.add(right).toJSON()).toEqual({ amount: '0.3', currency: 'EUR' })
  })

  it('adds negative and zero operands with exact sign semantics', () => {
    expect(
      Money.from({ amount: '10.00', currency: 'EUR' })
        .add(Money.from({ amount: '-12.50', currency: 'EUR' }))
        .toJSON(),
    ).toEqual({ amount: '-2.50', currency: 'EUR' })

    expect(
      Money.from({ amount: '7.125', currency: 'EUR' }).add(Money.from({ amount: '0', currency: 'EUR' })).toJSON(),
    ).toEqual({ amount: '7.125', currency: 'EUR' })

    expect(
      Money.from({ amount: '1.00', currency: 'EUR' }).add(Money.from({ amount: '-1.00', currency: 'EUR' })).toJSON(),
    ).toEqual({ amount: '0.00', currency: 'EUR' })
  })

  it('aligns differing decimal scales without rounding', () => {
    expect(
      Money.from({ amount: '1.2', currency: 'EUR' }).add(Money.from({ amount: '0.03', currency: 'EUR' })).toJSON(),
    ).toEqual({ amount: '1.23', currency: 'EUR' })

    expect(
      Money.from({ amount: '1.20', currency: 'EUR' })
        .subtract(Money.from({ amount: '0.003', currency: 'EUR' }))
        .toJSON(),
    ).toEqual({ amount: '1.197', currency: 'EUR' })
  })

  it('formats whole-number arithmetic results without a decimal separator', () => {
    expect(
      Money.from({ amount: '10', currency: 'EUR' }).subtract(Money.from({ amount: '3', currency: 'EUR' })).toJSON(),
    ).toEqual({ amount: '7', currency: 'EUR' })

    expect(
      Money.from({ amount: '3', currency: 'EUR' }).subtract(Money.from({ amount: '10', currency: 'EUR' })).toJSON(),
    ).toEqual({ amount: '-7', currency: 'EUR' })
  })

  it('subtracts compatible currencies exactly in operand order', () => {
    const left = Money.from({ amount: '10.00', currency: 'EUR' })
    const right = Money.from({ amount: '3.25', currency: 'EUR' })

    const difference = left.subtract(right)

    expect(difference.toJSON()).toEqual({ amount: '6.75', currency: 'EUR' })
    expect(left.toJSON()).toEqual({ amount: '10.00', currency: 'EUR' })
    expect(right.toJSON()).toEqual({ amount: '3.25', currency: 'EUR' })
  })

  it('preserves exact negative subtraction results', () => {
    expect(
      Money.from({ amount: '3.25', currency: 'EUR' })
        .subtract(Money.from({ amount: '10.00', currency: 'EUR' }))
        .toJSON(),
    ).toEqual({ amount: '-6.75', currency: 'EUR' })
  })

  it('rejects addition and subtraction across incompatible currencies without mutating operands', () => {
    const left = Money.from({ amount: '10.00', currency: 'EUR' })
    const right = Money.from({ amount: '5.00', currency: 'USD' })

    for (const operation of [() => left.add(right), () => left.subtract(right)]) {
      expect(operation).toThrow(CurrencyMismatchError)
      try {
        operation()
      } catch (error) {
        expect(error).toBeInstanceOf(FinFlowMoneyError)
        expect((error as FinFlowMoneyError).code).toBe('FINFLOW_MONEY_CURRENCY_MISMATCH')
      }
    }

    expect(left.toJSON()).toEqual({ amount: '10.00', currency: 'EUR' })
    expect(right.toJSON()).toEqual({ amount: '5.00', currency: 'USD' })
  })

  it('negates amounts exactly while preserving currency and operand value', () => {
    const positive = Money.from({ amount: '10.25', currency: 'EUR' })
    const negative = Money.from({ amount: '-10.250', currency: 'EUR' })
    const zero = Money.from({ amount: '0.00', currency: 'EUR' })

    expect(positive.negate().toJSON()).toEqual({ amount: '-10.25', currency: 'EUR' })
    expect(negative.negate().toJSON()).toEqual({ amount: '10.250', currency: 'EUR' })
    expect(zero.negate().toJSON()).toEqual({ amount: '0.00', currency: 'EUR' })
    expect(Money.from({ amount: '-0.00', currency: 'EUR' }).negate().toJSON()).toEqual({
      amount: '0.00',
      currency: 'EUR',
    })
    expect(positive.toJSON()).toEqual({ amount: '10.25', currency: 'EUR' })
    expect(negative.toJSON()).toEqual({ amount: '-10.250', currency: 'EUR' })
    expect(zero.toJSON()).toEqual({ amount: '0.00', currency: 'EUR' })
  })

  it('multiplies by exact decimal scalars without rounding or binary floating-point arithmetic', () => {
    const money = Money.from({ amount: '10.25', currency: 'EUR' })

    expect(money.multiply('1.5').toJSON()).toEqual({ amount: '15.375', currency: 'EUR' })
    expect(Money.from({ amount: '0.1', currency: 'EUR' }).multiply('0.2').toJSON()).toEqual({
      amount: '0.02',
      currency: 'EUR',
    })
    expect(Money.from({ amount: '-12.50', currency: 'EUR' }).multiply('-2').toJSON()).toEqual({
      amount: '25.00',
      currency: 'EUR',
    })
    expect(money.toJSON()).toEqual({ amount: '10.25', currency: 'EUR' })
  })

  it('divides by non-zero exact decimal scalars when the quotient terminates', () => {
    const money = Money.from({ amount: '10.00', currency: 'EUR' })

    expect(money.divide('4').toJSON()).toEqual({ amount: '2.5', currency: 'EUR' })
    expect(Money.from({ amount: '1.20', currency: 'EUR' }).divide('0.3').toJSON()).toEqual({
      amount: '4',
      currency: 'EUR',
    })
    expect(Money.from({ amount: '-1.00', currency: 'EUR' }).divide('8').toJSON()).toEqual({
      amount: '-0.125',
      currency: 'EUR',
    })
    expect(Money.from({ amount: '1', currency: 'EUR' }).divide('5').toJSON()).toEqual({
      amount: '0.2',
      currency: 'EUR',
    })
    expect(Money.from({ amount: '1.25', currency: 'EUR' }).divide('-0.5').toJSON()).toEqual({
      amount: '-2.5',
      currency: 'EUR',
    })
    expect(money.toJSON()).toEqual({ amount: '10.00', currency: 'EUR' })
  })

  it('rejects zero divisors without mutating the operand', () => {
    const money = Money.from({ amount: '10.00', currency: 'EUR' })

    expect(() => money.divide('0.00')).toThrow(MoneyDivisionByZeroError)
    try {
      money.divide('0.00')
    } catch (error) {
      expect(error).toBeInstanceOf(FinFlowMoneyError)
      expect((error as FinFlowMoneyError).code).toBe('FINFLOW_MONEY_DIVISION_BY_ZERO')
    }
    expect(money.toJSON()).toEqual({ amount: '10.00', currency: 'EUR' })
  })

  it('rejects non-terminating quotients without choosing an implicit rounding policy', () => {
    const money = Money.from({ amount: '1', currency: 'EUR' })

    expect(() => money.divide('3')).toThrow(MoneyRoundingRequiredError)
    try {
      money.divide('3')
    } catch (error) {
      expect(error).toBeInstanceOf(FinFlowMoneyError)
      expect((error as FinFlowMoneyError).code).toBe('FINFLOW_MONEY_ROUNDING_REQUIRED')
    }
    expect(money.toJSON()).toEqual({ amount: '1', currency: 'EUR' })
  })
})
