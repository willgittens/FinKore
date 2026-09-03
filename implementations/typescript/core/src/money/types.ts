/**
 * Canonical portable JSON shape for a FinFlow Money value.
 *
 * The amount is encoded as a plain base-10 decimal string and the currency is
 * encoded as its identifier. This type describes interchange shape only; it
 * does not make the TypeScript implementation canonical for FinFlow itself.
 *
 * @see MONEY-SERIALIZATION-001
 * @see MONEY-SERIALIZATION-002
 * @see MONEY-SERIALIZATION-004
 */
export interface SerializedMoney {
  /**
   * Exact decimal monetary amount in FinFlow's portable string encoding.
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
 * Input accepted by {@link Money.from} before FinFlow Money validation.
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
 * Exact numeric ordering result for compatible FinFlow Money values.
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
 * Portable FinFlow Money error code.
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
  | 'FINFLOW_MONEY_INVALID_AMOUNT'
  | 'FINFLOW_MONEY_INVALID_CURRENCY'
  | 'FINFLOW_MONEY_CURRENCY_MISMATCH'
  | 'FINFLOW_MONEY_DIVISION_BY_ZERO'
  | 'FINFLOW_MONEY_ROUNDING_REQUIRED'
  | 'FINFLOW_MONEY_INVALID_ROUNDING'
