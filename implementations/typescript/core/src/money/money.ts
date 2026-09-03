import { Currency } from './currency.js'
import { CurrencyMismatchError } from './errors.js'
import { serializeMoney, validateSerializedAmount } from './serialization.js'
import type { MoneyInput, SerializedMoney } from './types.js'

interface DecimalParts {
  readonly integer: bigint
  readonly scale: number
}

function decimalParts(amount: string): DecimalParts {
  const [whole, fraction = ''] = amount.split('.')
  const digits = `${whole}${fraction}`
  return { integer: BigInt(digits), scale: fraction.length }
}

function scaleDecimal(parts: DecimalParts, scale: number): bigint {
  return parts.integer * 10n ** BigInt(scale - parts.scale)
}

function formatDecimal(integer: bigint, scale: number): string {
  const negative = integer < 0n
  const unsignedDigits = integer.toString().replace('-', '').padStart(scale + 1, '0')
  if (scale === 0) return `${negative ? '-' : ''}${unsignedDigits}`

  const whole = unsignedDigits.slice(0, -scale)
  const fraction = unsignedDigits.slice(-scale)
  return `${negative ? '-' : ''}${whole}.${fraction}`
}

function addDecimals(left: string, right: string): string {
  const leftParts = decimalParts(left)
  const rightParts = decimalParts(right)
  const scale = Math.max(leftParts.scale, rightParts.scale)
  return formatDecimal(scaleDecimal(leftParts, scale) + scaleDecimal(rightParts, scale), scale)
}

function subtractDecimals(left: string, right: string): string {
  const leftParts = decimalParts(left)
  const rightParts = decimalParts(right)
  const scale = Math.max(leftParts.scale, rightParts.scale)
  return formatDecimal(scaleDecimal(leftParts, scale) - scaleDecimal(rightParts, scale), scale)
}

/**
 * TypeScript Money value for the first FinFlow reference implementation
 * milestone.
 *
 * A Money value binds an exact decimal amount to a currency identifier. This
 * milestone supports construction, validation, canonical serialization,
 * compatible-currency addition, and compatible-currency subtraction.
 * Comparison, rounding, multiplication, and division are intentionally absent.
 *
 * @remarks
 * This TypeScript implementation stores the validated decimal representation
 * internally as a string. That is an implementation detail, not a requirement
 * imposed by the FinFlow specification.
 *
 * @see MONEY-REPRESENTATION-001
 * @see MONEY-REPRESENTATION-002
 * @see MONEY-REPRESENTATION-003
 * @see MONEY-REPRESENTATION-006
 */
export class Money {
  /**
   * Validated exact decimal amount as preserved by this implementation.
   *
   * @remarks
   * The string storage choice preserves this milestone's observable
   * serialization behavior without using unsafe binary floating-point
   * arithmetic.
   */
  readonly amount: string

  /**
   * Currency associated with the amount.
   *
   * @see MONEY-REPRESENTATION-001
   */
  readonly currency: Currency

  private constructor(amount: string, currency: Currency) {
    this.amount = amount
    this.currency = currency
  }

  /**
   * Creates a Money value from an exact decimal amount and currency identifier.
   *
   * This operation validates both components and returns a new Money value. It
   * does not mutate any existing Money value.
   *
   * @param input - Candidate Money components containing the decimal amount and
   * currency identifier.
   * @returns A new Money value preserving the validated amount and currency.
   * @throws {InvalidMoneyAmountError}
   * When the amount violates FinFlow Money representation or serialization
   * requirements.
   * @throws {InvalidCurrencyError}
   * When the currency identifier is missing or invalid.
   *
   * @example
   * ```ts
   * const money = Money.from({
   *   amount: '1299.90',
   *   currency: 'EUR',
   * })
   * ```
   *
   * @see FINFLOW_MONEY_INVALID_AMOUNT
   * @see FINFLOW_MONEY_INVALID_CURRENCY
   * @see MONEY-REPRESENTATION-001
   * @see MONEY-SERIALIZATION-002
   * @see MONEY-SERIALIZATION-004
   */
  static from(input: MoneyInput): Money {
    const amount = validateSerializedAmount(input.amount)
    const currency = Currency.of(input.currency)
    return new Money(amount, currency)
  }

  /**
   * Parses a portable FinFlow Money JSON value.
   *
   * Unknown object members may be present, but they do not alter the meaning of
   * `amount` or `currency`. This operation returns a new Money value and does
   * not mutate the supplied input object.
   *
   * @param value - Candidate portable Money serialization.
   * @returns A new Money value parsed from the canonical members.
   * @throws {InvalidMoneyAmountError}
   * When `amount` is missing, malformed, non-finite, or unsupported.
   * @throws {InvalidCurrencyError}
   * When `currency` is missing or invalid.
   *
   * @see MONEY-SERIALIZATION-001
   * @see MONEY-SERIALIZATION-005
   * @see MONEY-SERIALIZATION-006
   * @see MONEY-SERIALIZATION-007
   */
  static deserialize(value: unknown): Money {
    if (typeof value !== 'object' || value === null) {
      return Money.from({ amount: undefined, currency: undefined })
    }
    const candidate = value as Partial<Record<keyof SerializedMoney, unknown>>
    return Money.from({ amount: candidate.amount, currency: candidate.currency })
  }

  /**
   * Adds another Money value using exact decimal semantics.
   *
   * Both operands must use the same currency identifier in this milestone's
   * ISO 4217 scope. The returned Money value preserves that currency, and
   * neither operand is mutated.
   *
   * @param other - Money value to add to this value.
   * @returns A new Money value containing the exact sum.
   * @throws {CurrencyMismatchError}
   * When the operands use incompatible currencies.
   *
   * @see FINFLOW_MONEY_CURRENCY_MISMATCH
   * @see MONEY-ARITHMETIC-001
   * @see MONEY-ARITHMETIC-002
   * @see MONEY-ARITHMETIC-007
   * @see MONEY-ARITHMETIC-009
   * @see MONEY-CURRENCY-003
   * @see MONEY-CURRENCY-004
   * @see MONEY-ERROR-003
   * @see MONEY-ERROR-007
   */
  add(other: Money): Money {
    this.assertCompatibleCurrency(other)
    return new Money(addDecimals(this.amount, other.amount), this.currency)
  }

  /**
   * Subtracts another Money value using exact decimal semantics.
   *
   * Both operands must use the same currency identifier in this milestone's
   * ISO 4217 scope. The returned Money value preserves this value's currency,
   * and neither operand is mutated.
   *
   * @param other - Money value to subtract from this value.
   * @returns A new Money value containing the exact difference.
   * @throws {CurrencyMismatchError}
   * When the operands use incompatible currencies.
   *
   * @see FINFLOW_MONEY_CURRENCY_MISMATCH
   * @see MONEY-ARITHMETIC-001
   * @see MONEY-ARITHMETIC-002
   * @see MONEY-ARITHMETIC-007
   * @see MONEY-ARITHMETIC-009
   * @see MONEY-CURRENCY-003
   * @see MONEY-CURRENCY-004
   * @see MONEY-ERROR-003
   * @see MONEY-ERROR-007
   */
  subtract(other: Money): Money {
    this.assertCompatibleCurrency(other)
    return new Money(subtractDecimals(this.amount, other.amount), this.currency)
  }

  /**
   * Returns the canonical FinFlow Money serialization.
   *
   * The representation is locale-independent and intended for portable
   * FinFlow interoperability. Calling this method does not mutate the Money
   * value.
   *
   * @returns A new object containing the serialized amount and currency.
   *
   * @example
   * ```ts
   * const serialized = Money.from({
   *   amount: '1299.90',
   *   currency: 'EUR',
   * }).toJSON()
   * ```
   *
   * @see MONEY-SERIALIZATION-001
   * @see MONEY-SERIALIZATION-002
   * @see MONEY-SERIALIZATION-008
   */
  toJSON(): SerializedMoney {
    return serializeMoney(this.amount, this.currency.code)
  }

  private assertCompatibleCurrency(other: Money): void {
    if (this.currency.code !== other.currency.code) {
      throw new CurrencyMismatchError()
    }
  }
}
