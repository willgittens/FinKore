// SPDX-License-Identifier: MPL-2.0
/**
 * Canonical portable JSON shape for a FinKore Money value.
 *
 * The amount is encoded as a plain base-10 decimal string and the currency is
 * encoded as its identifier. This type describes interchange shape only; it
 * does not make the TypeScript implementation canonical for FinKore itself.
 *
 * @see MONEY-SERIALIZATION-001
 * @see MONEY-SERIALIZATION-002
 * @see MONEY-SERIALIZATION-004
 */
export interface SerializedMoney {
  /**
   * Exact decimal monetary amount in FinKore's portable string encoding.
   *
   * @see MONEY-REPRESENTATION-002
   * @see MONEY-SERIALIZATION-002
   */
  readonly amount: string

  /**
   * Currency identifier associated with the amount.
   *
   * @see MONEY-REPRESENTATION-001
   * @see MONEY-CURRENCY-001
   */
  readonly currency: string
}

/**
 * Input accepted by {@link Money.from} before FinKore Money validation.
 *
 * The fields are intentionally `unknown` so the constructor can reject invalid
 * portable values with the specified Money error codes.
 *
 * @see MONEY-ERROR-001
 * @see MONEY-ERROR-002
 */
export interface MoneyInput {
  /**
   * Candidate exact decimal amount.
   *
   * @see MONEY-SERIALIZATION-002
   */
  readonly amount: unknown

  /**
   * Candidate currency identifier.
   *
   * @see MONEY-SERIALIZATION-004
   */
  readonly currency: unknown
}

/**
 * Exact numeric ordering result for compatible FinKore Money values.
 *
 * The result is independent of insignificant decimal trailing zeros and is
 * defined only after currency compatibility succeeds.
 *
 * @see MONEY-COMPARISON-001
 * @see MONEY-COMPARISON-002
 * @see MONEY-COMPARISON-003
 */
export type MoneyComparisonResult = 'LESS' | 'EQUAL' | 'GREATER'

/**
 * FinKore rounding modes supported by every conforming Money implementation.
 *
 * These identifiers are the canonical portable values defined by the Money
 * rounding specification. They intentionally do not include implementation
 * aliases such as "bankers" or "truncate".
 *
 * @see MONEY-ROUNDING-003
 */
export type RoundingMode = 'HALF_UP' | 'HALF_EVEN' | 'DOWN' | 'UP' | 'FLOOR' | 'CEILING'

/**
 * Explicit rounding context for {@link Money.round}.
 *
 * FinKore rounding requires both a target scale and a rounding mode. The scale
 * is the number of fractional decimal digits in the rounded result; it is not
 * implicitly derived from the currency.
 *
 * @see MONEY-ROUNDING-001
 * @see MONEY-ROUNDING-004
 */
export interface MoneyRoundOptions {
  /**
   * Non-negative target scale for the rounded result.
   *
   * @see MONEY-ROUNDING-001
   */
  readonly scale: unknown

  /**
   * Canonical FinKore rounding mode.
   *
   * @see MONEY-ROUNDING-003
   */
  readonly mode: unknown
}

/**
 * Portable FinKore Money error code.
 *
 * Consumers that need cross-language semantics should rely on these codes
 * rather than TypeScript-specific error class names or messages.
 *
 * @see MONEY-ERROR-001
 * @see MONEY-ERROR-002
 * @see MONEY-ERROR-003
 * @see MONEY-ERROR-004
 * @see MONEY-ERROR-005
 * @see MONEY-ERROR-006
 */
export type MoneyErrorCode =
  | 'FINKORE_MONEY_INVALID_AMOUNT'
  | 'FINKORE_MONEY_INVALID_CURRENCY'
  | 'FINKORE_MONEY_CURRENCY_MISMATCH'
  | 'FINKORE_MONEY_DIVISION_BY_ZERO'
  | 'FINKORE_MONEY_ROUNDING_REQUIRED'
  | 'FINKORE_MONEY_INVALID_ROUNDING'
