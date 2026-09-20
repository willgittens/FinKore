// SPDX-License-Identifier: MPL-2.0
import { Currency } from './currency.js'
import {
  CurrencyMismatchError,
  InvalidMoneyAllocationError,
  InvalidMoneyAmountError,
  InvalidMoneyRoundingError,
  MoneyDivisionByZeroError,
  MoneyRoundingRequiredError,
} from './errors.js'
import { serializeMoney, validateSerializedAmount } from './serialization.js'
import type {
  MoneyAllocationRequest,
  MoneyComparisonResult,
  MoneyInput,
  MoneyRateApplicationOptions,
  MoneyRoundOptions,
  RoundingMode,
  SerializedMoney,
} from './types.js'

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

function multiplyDecimals(left: string, right: string): string {
  const leftParts = decimalParts(left)
  const rightParts = decimalParts(right)
  return formatDecimal(leftParts.integer * rightParts.integer, leftParts.scale + rightParts.scale)
}

function percentageRateScalar(value: string): string {
  const parts = decimalParts(value)
  return formatDecimal(parts.integer, parts.scale + 2)
}

function validateRateScalar(value: unknown): string {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new InvalidMoneyAmountError()
  }
  const candidate = value as { readonly kind?: unknown; readonly value?: unknown }
  const rateValue = validateSerializedAmount(candidate.value)

  switch (candidate.kind) {
    case 'DECIMAL':
      return rateValue
    case 'PERCENTAGE':
      return percentageRateScalar(rateValue)
    default:
      throw new InvalidMoneyAmountError()
  }
}

function rateApplicationRounding(options: MoneyRateApplicationOptions | undefined): MoneyRoundOptions | undefined {
  if (options === undefined) return undefined
  if (typeof options !== 'object' || options === null || Array.isArray(options)) {
    throw new InvalidMoneyRoundingError()
  }
  return options.rounding as MoneyRoundOptions | undefined
}

function gcd(left: bigint, right: bigint): bigint {
  // Stryker disable next-line EqualityOperator: bigint has no distinct negative zero, so `< 0n` and `<= 0n` are equivalent here.
  let a = left < 0n ? -left : left
  let b = right
  while (b !== 0n) {
    const remainder = a % b
    a = b
    b = remainder
  }
  return a
}

function factorCount(value: bigint, factor: bigint): number {
  let remaining = value
  let count = 0
  while (remaining % factor === 0n) {
    remaining /= factor
    count += 1
  }
  return count
}

function divideDecimals(dividend: string, divisor: string): string {
  const dividendParts = decimalParts(dividend)
  const divisorParts = decimalParts(divisor)
  if (divisorParts.integer === 0n) {
    throw new MoneyDivisionByZeroError()
  }

  // Stryker disable next-line EqualityOperator: zero divisors are rejected above, so `< 0n` and `<= 0n` are equivalent here.
  const divisorMagnitude = divisorParts.integer < 0n ? -divisorParts.integer : divisorParts.integer
  // Stryker disable next-line EqualityOperator: zero divisors are rejected above, so `< 0n` and `<= 0n` are equivalent here.
  const numeratorSign = divisorParts.integer < 0n ? -1n : 1n
  // Stryker disable next-line ArithmeticOperator: multiplying and dividing by a sign value constrained to `1n | -1n` are equivalent.
  let numerator = dividendParts.integer * numeratorSign * 10n ** BigInt(divisorParts.scale)
  let denominator = divisorMagnitude * 10n ** BigInt(dividendParts.scale)

  const divisorGcd = gcd(numerator, denominator)
  numerator /= divisorGcd
  denominator /= divisorGcd

  const twos = factorCount(denominator, 2n)
  const withoutTwos = denominator / 2n ** BigInt(twos)
  const fives = factorCount(withoutTwos, 5n)
  const remaining = withoutTwos / 5n ** BigInt(fives)
  if (remaining !== 1n) {
    throw new MoneyRoundingRequiredError()
  }

  const scale = Math.max(twos, fives)
  const scaledInteger = numerator * 2n ** BigInt(scale - twos) * 5n ** BigInt(scale - fives)
  return formatDecimal(scaledInteger, scale)
}

function negateDecimal(amount: string): string {
  const parts = decimalParts(amount)
  if (parts.integer === 0n) return formatDecimal(0n, parts.scale)
  return amount.startsWith('-') ? amount.slice(1) : `-${amount}`
}

function compareDecimals(left: string, right: string): MoneyComparisonResult {
  const leftParts = decimalParts(left)
  const rightParts = decimalParts(right)
  const scale = Math.max(leftParts.scale, rightParts.scale)
  const scaledLeft = scaleDecimal(leftParts, scale)
  const scaledRight = scaleDecimal(rightParts, scale)

  if (scaledLeft < scaledRight) return 'LESS'
  if (scaledLeft > scaledRight) return 'GREATER'
  return 'EQUAL'
}

function validateRoundingOptions(options: MoneyRoundOptions): { readonly scale: number; readonly mode: RoundingMode } {
  if (typeof options !== 'object' || options === null) {
    throw new InvalidMoneyRoundingError()
  }
  const scale = options.scale
  if (!Number.isSafeInteger(scale) || (scale as number) < 0) {
    throw new InvalidMoneyRoundingError()
  }
  switch (options.mode) {
    case 'HALF_UP':
    case 'HALF_EVEN':
    case 'DOWN':
    case 'UP':
    case 'FLOOR':
    case 'CEILING':
      return { scale: scale as number, mode: options.mode }
    default:
      throw new InvalidMoneyRoundingError()
  }
}

function shouldIncrement(
  mode: RoundingMode,
  negative: boolean,
  retainedMagnitude: bigint,
  discardedMagnitude: bigint,
  divisor: bigint,
): boolean {
  if (discardedMagnitude === 0n) return false

  switch (mode) {
    case 'DOWN':
      return false
    case 'UP':
      return true
    case 'FLOOR':
      return negative
    case 'CEILING':
      return !negative
    case 'HALF_UP':
      return discardedMagnitude * 2n >= divisor
    case 'HALF_EVEN': {
      const tieComparison = discardedMagnitude * 2n
      if (tieComparison > divisor) return true
      if (tieComparison < divisor) return false
      return retainedMagnitude % 2n !== 0n
    }
    // Stryker disable next-line all: validateRoundingOptions narrows all public inputs to supported modes before this internal helper is called.
    default: {
      const unsupported: never = mode
      throw new InvalidMoneyRoundingError('Invalid Money rounding mode', { mode: unsupported })
    }
  }
}

function roundDecimal(amount: string, targetScale: number, mode: RoundingMode): string {
  const parts = decimalParts(amount)
  // Stryker disable next-line EqualityOperator: at equal scale the reduction path also discards zero digits and returns the same decimal value.
  if (targetScale >= parts.scale) {
    return formatDecimal(scaleDecimal(parts, targetScale), targetScale)
  }

  const scaleDifference = parts.scale - targetScale
  const divisor = 10n ** BigInt(scaleDifference)
  // Stryker disable next-line EqualityOperator: bigint has no distinct negative zero.
  const negative = parts.integer < 0n
  // Stryker disable next-line EqualityOperator: bigint has no distinct negative zero.
  const magnitude = parts.integer < 0n ? -parts.integer : parts.integer
  const retainedMagnitude = magnitude / divisor
  const discardedMagnitude = magnitude % divisor
  const increment = shouldIncrement(mode, negative, retainedMagnitude, discardedMagnitude, divisor) ? 1n : 0n
  const roundedMagnitude = retainedMagnitude + increment
  const roundedInteger = negative ? -roundedMagnitude : roundedMagnitude

  return formatDecimal(roundedInteger, targetScale)
}

function validateAllocationScale(scale: unknown): number {
  if (!Number.isInteger(scale) || (scale as number) < 0 || (scale as number) > 50) {
    throw new InvalidMoneyAllocationError()
  }
  return scale as number
}

function validateAllocationPartCount(parts: unknown): number {
  if (!Number.isInteger(parts) || (parts as number) <= 0 || (parts as number) > 100) {
    throw new InvalidMoneyAllocationError()
  }
  return parts as number
}

function validateAllocationRatio(ratio: unknown): bigint {
  if (!Number.isSafeInteger(ratio) || (ratio as number) <= 0) {
    throw new InvalidMoneyAllocationError()
  }
  return BigInt(ratio as number)
}

function validateAllocationRequest(input: MoneyAllocationRequest): { readonly scale: number; readonly weights: readonly bigint[] } {
  if (input === null || input === undefined || Array.isArray(input)) {
    throw new InvalidMoneyAllocationError()
  }
  const candidate = input as {
    readonly method?: unknown
    readonly scale?: unknown
    readonly parts?: unknown
    readonly ratios?: unknown
  }
  const scale = validateAllocationScale(candidate.scale)

  switch (candidate.method) {
    case 'EQUAL': {
      if (!Object.hasOwn(candidate, 'parts') || Object.hasOwn(candidate, 'ratios')) {
        throw new InvalidMoneyAllocationError()
      }
      const parts = validateAllocationPartCount(candidate.parts)
      return { scale, weights: Array.from({ length: parts }, () => 1n) }
    }
    case 'RATIO': {
      if (!Object.hasOwn(candidate, 'ratios') || Object.hasOwn(candidate, 'parts') || !Array.isArray(candidate.ratios) || candidate.ratios.length === 0) {
        throw new InvalidMoneyAllocationError()
      }
      return { scale, weights: candidate.ratios.map(validateAllocationRatio) }
    }
    default:
      throw new InvalidMoneyAllocationError()
  }
}

function allocationUnitsAtScale(amount: string, targetScale: number): bigint {
  const parts = decimalParts(amount)
  // Stryker disable next-line EqualityOperator: at equal scale the reduction path divides by one and returns the same integer units.
  if (targetScale > parts.scale) {
    return scaleDecimal(parts, targetScale)
  }

  const divisor = 10n ** BigInt(parts.scale - targetScale)
  if (parts.integer % divisor !== 0n) {
    throw new MoneyRoundingRequiredError()
  }
  return parts.integer / divisor
}

function allocateUnitAmounts(sourceUnits: bigint, weights: readonly bigint[]): readonly bigint[] {
  // Stryker disable next-line EqualityOperator: bigint has no distinct negative zero.
  const negative = sourceUnits < 0n
  const absoluteUnits = negative ? -sourceUnits : sourceUnits
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0n)
  let remainder = absoluteUnits
  const baseUnits = weights.map((weight) => {
    const units = (absoluteUnits * weight) / totalWeight
    remainder -= units
    return units
  })

  return baseUnits.map((units, index) => {
    const allocatedMagnitude = units + (BigInt(index) < remainder ? 1n : 0n)
    return negative ? -allocatedMagnitude : allocatedMagnitude
  })
}

/**
 * TypeScript Money value for the FinKore Core 0.9 release candidate reference
 * implementation.
 *
 * A Money value binds an exact decimal amount to a currency identifier. This
 * Core 0.9 release candidate supports construction, validation, canonical
 * serialization, compatible-currency addition, compatible-currency subtraction,
 * negation, exact decimal scalar multiplication and division, exact Rate
 * application, Money allocation by equal parts or positive integer ratios,
 * exact compatible-currency numeric comparison, and explicit Money rounding.
 *
 * @remarks
 * This TypeScript implementation stores the validated decimal representation
 * internally as a string. That is an implementation detail, not a requirement
 * imposed by the FinKore specification.
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
   * The string storage choice preserves Core 0.9 release candidate observable
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
   * When the amount violates FinKore Money representation or serialization
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
   * @see FINKORE_MONEY_INVALID_AMOUNT
   * @see FINKORE_MONEY_INVALID_CURRENCY
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
   * Parses a portable FinKore Money JSON value.
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
      throw new InvalidMoneyAmountError()
    }
    const candidate = value as Partial<Record<keyof SerializedMoney, unknown>>
    return Money.from({ amount: candidate.amount, currency: candidate.currency })
  }

  /**
   * Adds another Money value using exact decimal semantics.
   *
   * Both operands must use the same currency identifier in the Core 0.9
   * release candidate ISO 4217 scope. The returned Money value preserves that currency, and
   * neither operand is mutated.
   *
   * @param other - Money value to add to this value.
   * @returns A new Money value containing the exact sum.
   * @throws {CurrencyMismatchError}
   * When the operands use incompatible currencies.
   *
   * @see FINKORE_MONEY_CURRENCY_MISMATCH
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
   * Both operands must use the same currency identifier in the Core 0.9
   * release candidate ISO 4217 scope. The returned Money value preserves this value's currency,
   * and neither operand is mutated.
   *
   * @param other - Money value to subtract from this value.
   * @returns A new Money value containing the exact difference.
   * @throws {CurrencyMismatchError}
   * When the operands use incompatible currencies.
   *
   * @see FINKORE_MONEY_CURRENCY_MISMATCH
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
   * Reverses this Money value's amount sign exactly while preserving currency.
   *
   * The returned Money value preserves this value's currency and this operation
   * does not mutate the current value.
   *
   * @returns A new Money value with the opposite numeric sign.
   *
   * @see MONEY-ARITHMETIC-003
   * @see MONEY-ARITHMETIC-009
   */
  negate(): Money {
    return new Money(negateDecimal(this.amount), this.currency)
  }

  /**
   * Multiplies this Money value by an exact decimal scalar.
   *
   * The scalar must use FinKore's plain base-10 decimal string representation.
   * The operation preserves exact decimal results and currency, and does not
   * mutate the current value.
   *
   * @param scalar - Exact decimal scalar in plain notation.
   * @returns A new Money value containing the exact product.
   * @throws {InvalidMoneyAmountError}
   * When the scalar is missing, malformed, non-finite, or unsupported.
   *
   * @see FINKORE_MONEY_INVALID_AMOUNT
   * @see MONEY-ARITHMETIC-004
   * @see MONEY-ARITHMETIC-007
   * @see MONEY-ARITHMETIC-009
   * @see MONEY-ERROR-001
   */
  multiply(scalar: unknown): Money {
    const validatedScalar = validateSerializedAmount(scalar)
    return new Money(multiplyDecimals(this.amount, validatedScalar), this.currency)
  }

  /**
   * Divides this Money value by an exact decimal scalar when the quotient is
   * exactly representable in base 10.
   *
   * This operation does not choose a rounding policy implicitly. Non-
   * terminating decimal quotients fail with `FINKORE_MONEY_ROUNDING_REQUIRED`.
   * The returned Money value preserves this value's currency, and this
   * operation does not mutate the current value.
   *
   * @param scalar - Non-zero exact decimal scalar in plain notation.
   * @returns A new Money value containing the exact quotient.
   * @throws {InvalidMoneyAmountError}
   * When the scalar is missing, malformed, non-finite, or unsupported.
   * @throws {MoneyDivisionByZeroError}
   * When the scalar is numerically zero.
   * @throws {MoneyRoundingRequiredError}
   * When the exact quotient would require precision reduction and no rounding
   * policy is supplied.
   *
   * @see FINKORE_MONEY_INVALID_AMOUNT
   * @see FINKORE_MONEY_DIVISION_BY_ZERO
   * @see FINKORE_MONEY_ROUNDING_REQUIRED
   * @see MONEY-ARITHMETIC-005
   * @see MONEY-ARITHMETIC-006
   * @see MONEY-ARITHMETIC-007
   * @see MONEY-ARITHMETIC-008
   * @see MONEY-ARITHMETIC-009
   * @see MONEY-ERROR-001
   * @see MONEY-ERROR-004
   * @see MONEY-ERROR-005
   * @see MONEY-ERROR-007
   */
  divide(scalar: unknown): Money {
    const validatedScalar = validateSerializedAmount(scalar)
    return new Money(divideDecimals(this.amount, validatedScalar), this.currency)
  }


  /**
   * Applies an exact decimal or percentage Rate to this Money value.
   *
   * `DECIMAL` Rate values are applied directly as scalars. `PERCENTAGE` Rate
   * values are divided by 100 exactly before multiplication. Without explicit
   * rounding options, this operation returns the exact decimal product and does
   * not infer currency minor-unit rounding. When `options.rounding` is supplied,
   * rounding is applied after the exact product is computed.
   *
   * @param rate - Candidate Rate representation and exact decimal value.
   * @param options - Optional explicit rounding context for the Rate result.
   * @returns A new Money value containing the exact or explicitly rounded Rate result.
   * @throws {InvalidMoneyAmountError}
   * When the Rate representation or value is missing, malformed, non-finite, or unsupported.
   * @throws {InvalidMoneyRoundingError}
   * When an explicit rounding policy is invalid or unsupported.
   *
   * @see FINKORE_MONEY_INVALID_AMOUNT
   * @see FINKORE_MONEY_INVALID_ROUNDING
   * @see MONEY-RATE-001
   * @see MONEY-RATE-002
   * @see MONEY-RATE-003
   * @see MONEY-RATE-004
   * @see MONEY-RATE-005
   * @see MONEY-RATE-006
   * @see MONEY-RATE-007
   * @see MONEY-RATE-008
   * @see MONEY-RATE-009
   */
  applyRate(rate: unknown, options?: MoneyRateApplicationOptions): Money {
    const scalar = validateRateScalar(rate)
    const exact = new Money(multiplyDecimals(this.amount, scalar), this.currency)
    const rounding = rateApplicationRounding(options)
    return rounding === undefined ? exact : exact.round(rounding)
  }

  /**
   * Allocates this Money value into ordered Money results.
   *
   * Equal allocation uses a positive integer part count. Ratio allocation uses
   * a non-empty ordered list of positive integer ratios. Scale and part count
   * are bounded by `50` and `100`, respectively; each ratio is bounded by
   * `9007199254740991`. Every result is represented at the explicit target
   * scale, preserves this value's currency, and the exact numeric sum of all
   * results equals this value. Remainders are assigned to earliest declared
   * positions, including negative sources where the affected result magnitudes
   * increase.
   *
   * @param request - Allocation method, method-specific inputs, and explicit target scale.
   * @returns Ordered allocated Money values preserving the source total and currency.
   * @throws {InvalidMoneyAllocationError}
   * When the method, part count, ratios, or target scale are missing, malformed,
   * unsupported, or invalid.
   * @throws {MoneyRoundingRequiredError}
   * When the source amount cannot be represented as whole allocation units at
   * the requested target scale.
   *
   * @see FINKORE_MONEY_INVALID_ALLOCATION
   * @see FINKORE_MONEY_ROUNDING_REQUIRED
   * @see MONEY-ALLOCATION-001
   * @see MONEY-ALLOCATION-002
   * @see MONEY-ALLOCATION-003
   * @see MONEY-ALLOCATION-004
   * @see MONEY-ALLOCATION-005
   * @see MONEY-ALLOCATION-006
   * @see MONEY-ALLOCATION-007
   * @see MONEY-ALLOCATION-008
   * @see MONEY-ALLOCATION-009
   * @see MONEY-ALLOCATION-010
   * @see MONEY-ALLOCATION-011
   * @see MONEY-ALLOCATION-012
   * @see MONEY-ALLOCATION-013
   * @see MONEY-ALLOCATION-014
   * @see MONEY-ERROR-005
   * @see MONEY-ERROR-007
   * @see MONEY-ERROR-008
   */
  allocate(request: MoneyAllocationRequest): readonly Money[] {
    const { scale, weights } = validateAllocationRequest(request)
    const sourceUnits = allocationUnitsAtScale(this.amount, scale)
    return allocateUnitAmounts(sourceUnits, weights).map((units) => new Money(formatDecimal(units, scale), this.currency))
  }

  /**
   * Compares this Money value with another compatible-currency Money value.
   *
   * Comparison uses exact base-10 numeric semantics. Insignificant trailing
   * zeros do not affect equality, ordering is available only for compatible
   * currencies, and neither operand is mutated.
   *
   * @param other - Money value to compare with this value.
   * @returns `LESS`, `EQUAL`, or `GREATER` for this value relative to `other`.
   * @throws {CurrencyMismatchError}
   * When the operands use incompatible currencies.
   *
   * @see FINKORE_MONEY_CURRENCY_MISMATCH
   * @see MONEY-COMPARISON-001
   * @see MONEY-COMPARISON-002
   * @see MONEY-COMPARISON-003
   * @see MONEY-COMPARISON-004
   * @see MONEY-COMPARISON-006
   * @see MONEY-CURRENCY-003
   * @see MONEY-CURRENCY-004
   * @see MONEY-ERROR-003
   * @see MONEY-ERROR-007
   */
  compare(other: Money): MoneyComparisonResult {
    this.assertCompatibleCurrency(other)
    return compareDecimals(this.amount, other.amount)
  }

  /**
   * Rounds this Money value to an explicit target scale using a FinKore
   * rounding mode.
   *
   * The target scale is supplied by the caller and is not derived from the
   * currency's customary minor units. The returned Money value preserves this
   * value's currency, and this operation does not mutate the current value.
   *
   * @param options - Explicit target scale and canonical FinKore rounding mode.
   * @returns A new Money value containing the rounded result.
   * @throws {InvalidMoneyRoundingError}
   * When the target scale or rounding mode is invalid or unsupported.
   *
   * @see FINKORE_MONEY_INVALID_ROUNDING
   * @see MONEY-ROUNDING-001
   * @see MONEY-ROUNDING-002
   * @see MONEY-ROUNDING-003
   * @see MONEY-ROUNDING-004
   * @see MONEY-ROUNDING-008
   * @see MONEY-ROUNDING-009
   * @see MONEY-ERROR-006
   * @see MONEY-ERROR-007
   */
  round(options: MoneyRoundOptions): Money {
    const { scale, mode } = validateRoundingOptions(options)
    return new Money(roundDecimal(this.amount, scale, mode), this.currency)
  }

  /**
   * Returns the canonical FinKore Money serialization.
   *
   * The representation is locale-independent and intended for portable
   * FinKore interoperability. Calling this method does not mutate the Money
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
