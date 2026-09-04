import type { MoneyErrorCode } from './types.js'

/**
 * Base TypeScript error for portable FinFlow Money domain failures.
 *
 * Consumers requiring cross-language semantics should rely on {@link code}
 * rather than this TypeScript-specific class name or the human-readable
 * message.
 *
 * @see SPEC-ERROR-001
 * @see SPEC-ERROR-002
 * @see MONEY-ERROR-001
 */
export class FinFlowMoneyError extends Error {
  /**
   * Stable portable FinFlow Money error code.
   */
  readonly code: MoneyErrorCode

  /**
   * Optional implementation-provided structured context.
   *
   * Additional details must not change the meaning of the portable code.
   *
   * @see SPEC-ERROR-003
   * @see SPEC-ERROR-004
   */
  readonly details?: unknown

  /**
   * Creates a TypeScript Money error carrying a portable FinFlow code.
   *
   * @param code - Stable portable error category.
   * @param message - Non-normative human-readable message.
   * @param options - Optional structured context for diagnostics.
   */
  constructor(code: MoneyErrorCode, message: string, options: { readonly details?: unknown } = {}) {
    super(message)
    this.name = 'FinFlowMoneyError'
    this.code = code
    if (options.details !== undefined) this.details = options.details
  }
}

/**
 * TypeScript representation of the portable
 * `FINFLOW_MONEY_INVALID_AMOUNT` domain error.
 *
 * This class represents a missing, malformed, non-finite, or unsupported Money
 * amount. Cross-language consumers should rely on the portable code rather than
 * this TypeScript-specific class name.
 *
 * @see FINFLOW_MONEY_INVALID_AMOUNT
 * @see MONEY-ERROR-001
 */
export class InvalidMoneyAmountError extends FinFlowMoneyError {
  /**
   * Creates an invalid-amount Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Money amount', details?: unknown) {
    super('FINFLOW_MONEY_INVALID_AMOUNT', message, { details })
    this.name = 'InvalidMoneyAmountError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINFLOW_MONEY_INVALID_CURRENCY` domain error.
 *
 * This class represents a missing or invalid Money currency identifier.
 * Cross-language consumers should rely on the portable code rather than this
 * TypeScript-specific class name.
 *
 * @see FINFLOW_MONEY_INVALID_CURRENCY
 * @see MONEY-ERROR-002
 */
export class InvalidCurrencyError extends FinFlowMoneyError {
  /**
   * Creates an invalid-currency Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Money currency', details?: unknown) {
    super('FINFLOW_MONEY_INVALID_CURRENCY', message, { details })
    this.name = 'InvalidCurrencyError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINFLOW_MONEY_CURRENCY_MISMATCH` domain error.
 *
 * This class represents an operation receiving incompatible Money currencies.
 * Cross-language consumers should rely on the portable code rather than this
 * TypeScript-specific class name.
 *
 * @see FINFLOW_MONEY_CURRENCY_MISMATCH
 * @see MONEY-ERROR-003
 */
export class CurrencyMismatchError extends FinFlowMoneyError {
  /**
   * Creates a currency-mismatch Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Money currencies are incompatible', details?: unknown) {
    super('FINFLOW_MONEY_CURRENCY_MISMATCH', message, { details })
    this.name = 'CurrencyMismatchError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINFLOW_MONEY_DIVISION_BY_ZERO` domain error.
 *
 * This class represents a Money division by a numerically zero scalar.
 *
 * @see FINFLOW_MONEY_DIVISION_BY_ZERO
 * @see MONEY-ERROR-004
 */
export class MoneyDivisionByZeroError extends FinFlowMoneyError {
  /**
   * Creates a division-by-zero Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Money division by zero', details?: unknown) {
    super('FINFLOW_MONEY_DIVISION_BY_ZERO', message, { details })
    this.name = 'MoneyDivisionByZeroError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINFLOW_MONEY_ROUNDING_REQUIRED` domain error.
 *
 * This class represents a Money operation that would require precision
 * reduction when no applicable rounding policy is supplied.
 *
 * @see FINFLOW_MONEY_ROUNDING_REQUIRED
 * @see MONEY-ERROR-005
 */
export class MoneyRoundingRequiredError extends FinFlowMoneyError {
  /**
   * Creates a rounding-required Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Money rounding policy is required', details?: unknown) {
    super('FINFLOW_MONEY_ROUNDING_REQUIRED', message, { details })
    this.name = 'MoneyRoundingRequiredError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINFLOW_MONEY_INVALID_ROUNDING` domain error.
 *
 * This class represents an invalid or unsupported target scale or rounding
 * mode. Cross-language consumers should rely on the portable code rather than
 * this TypeScript-specific class name.
 *
 * @see FINFLOW_MONEY_INVALID_ROUNDING
 * @see MONEY-ERROR-006
 */
export class InvalidMoneyRoundingError extends FinFlowMoneyError {
  /**
   * Creates an invalid-rounding Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Money rounding', details?: unknown) {
    super('FINFLOW_MONEY_INVALID_ROUNDING', message, { details })
    this.name = 'InvalidMoneyRoundingError'
  }
}

/**
 * Narrows an unknown thrown value to a TypeScript FinFlow Money error.
 *
 * Use the narrowed error's portable {@link FinFlowMoneyError.code} when mapping
 * failures across language or adapter boundaries.
 *
 * @param error - Unknown thrown value.
 * @returns `true` when the value is a FinFlow Money error from this
 * implementation.
 */
export function isFinFlowMoneyError(error: unknown): error is FinFlowMoneyError {
  return error instanceof FinFlowMoneyError
}
