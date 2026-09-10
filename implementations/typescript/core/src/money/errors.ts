// SPDX-License-Identifier: MPL-2.0
import type { MoneyErrorCode } from './types.js'

/**
 * Base TypeScript error for portable FinKore Money domain failures.
 *
 * Consumers requiring cross-language semantics should rely on {@link code}
 * rather than this TypeScript-specific class name or the human-readable
 * message.
 *
 * @see SPEC-ERROR-001
 * @see SPEC-ERROR-002
 * @see MONEY-ERROR-001
 */
export class FinKoreMoneyError extends Error {
  /**
   * Stable portable FinKore Money error code.
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
   * Creates a TypeScript Money error carrying a portable FinKore code.
   *
   * @param code - Stable portable error category.
   * @param message - Non-normative human-readable message.
   * @param options - Optional structured context for diagnostics.
   */
  constructor(code: MoneyErrorCode, message: string, options: { readonly details?: unknown } = {}) {
    super(message)
    this.name = 'FinKoreMoneyError'
    this.code = code
    if (options.details !== undefined) this.details = options.details
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_MONEY_INVALID_AMOUNT` domain error.
 *
 * This class represents a missing, malformed, non-finite, or unsupported Money
 * amount. Cross-language consumers should rely on the portable code rather than
 * this TypeScript-specific class name.
 *
 * @see FINKORE_MONEY_INVALID_AMOUNT
 * @see MONEY-ERROR-001
 */
export class InvalidMoneyAmountError extends FinKoreMoneyError {
  /**
   * Creates an invalid-amount Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Money amount', details?: unknown) {
    super('FINKORE_MONEY_INVALID_AMOUNT', message, { details })
    this.name = 'InvalidMoneyAmountError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_MONEY_INVALID_CURRENCY` domain error.
 *
 * This class represents a missing or invalid Money currency identifier.
 * Cross-language consumers should rely on the portable code rather than this
 * TypeScript-specific class name.
 *
 * @see FINKORE_MONEY_INVALID_CURRENCY
 * @see MONEY-ERROR-002
 */
export class InvalidCurrencyError extends FinKoreMoneyError {
  /**
   * Creates an invalid-currency Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Money currency', details?: unknown) {
    super('FINKORE_MONEY_INVALID_CURRENCY', message, { details })
    this.name = 'InvalidCurrencyError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_MONEY_CURRENCY_MISMATCH` domain error.
 *
 * This class represents an operation receiving incompatible Money currencies.
 * Cross-language consumers should rely on the portable code rather than this
 * TypeScript-specific class name.
 *
 * @see FINKORE_MONEY_CURRENCY_MISMATCH
 * @see MONEY-ERROR-003
 */
export class CurrencyMismatchError extends FinKoreMoneyError {
  /**
   * Creates a currency-mismatch Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Money currencies are incompatible', details?: unknown) {
    super('FINKORE_MONEY_CURRENCY_MISMATCH', message, { details })
    this.name = 'CurrencyMismatchError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_MONEY_DIVISION_BY_ZERO` domain error.
 *
 * This class represents a Money division by a numerically zero scalar.
 *
 * @see FINKORE_MONEY_DIVISION_BY_ZERO
 * @see MONEY-ERROR-004
 */
export class MoneyDivisionByZeroError extends FinKoreMoneyError {
  /**
   * Creates a division-by-zero Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Money division by zero', details?: unknown) {
    super('FINKORE_MONEY_DIVISION_BY_ZERO', message, { details })
    this.name = 'MoneyDivisionByZeroError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_MONEY_ROUNDING_REQUIRED` domain error.
 *
 * This class represents a Money operation that would require precision
 * reduction when no applicable rounding policy is supplied.
 *
 * @see FINKORE_MONEY_ROUNDING_REQUIRED
 * @see MONEY-ERROR-005
 */
export class MoneyRoundingRequiredError extends FinKoreMoneyError {
  /**
   * Creates a rounding-required Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Money rounding policy is required', details?: unknown) {
    super('FINKORE_MONEY_ROUNDING_REQUIRED', message, { details })
    this.name = 'MoneyRoundingRequiredError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_MONEY_INVALID_ROUNDING` domain error.
 *
 * This class represents an invalid or unsupported target scale or rounding
 * mode. Cross-language consumers should rely on the portable code rather than
 * this TypeScript-specific class name.
 *
 * @see FINKORE_MONEY_INVALID_ROUNDING
 * @see MONEY-ERROR-006
 */
export class InvalidMoneyRoundingError extends FinKoreMoneyError {
  /**
   * Creates an invalid-rounding Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Money rounding', details?: unknown) {
    super('FINKORE_MONEY_INVALID_ROUNDING', message, { details })
    this.name = 'InvalidMoneyRoundingError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_MONEY_INVALID_ALLOCATION` domain error.
 *
 * This class represents an invalid allocation method, part count, ratio list,
 * ratio value, or target scale. Cross-language consumers should rely on the
 * portable code rather than this TypeScript-specific class name.
 *
 * @see FINKORE_MONEY_INVALID_ALLOCATION
 * @see MONEY-ERROR-008
 */
export class InvalidMoneyAllocationError extends FinKoreMoneyError {
  /**
   * Creates an invalid-allocation Money error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Money allocation', details?: unknown) {
    super('FINKORE_MONEY_INVALID_ALLOCATION', message, { details })
    this.name = 'InvalidMoneyAllocationError'
  }
}

/**
 * Narrows an unknown thrown value to a TypeScript FinKore Money error.
 *
 * Use the narrowed error's portable {@link FinKoreMoneyError.code} when mapping
 * failures across language or adapter boundaries.
 *
 * @param error - Unknown thrown value.
 * @returns `true` when the value is a FinKore Money error from this
 * implementation.
 */
export function isFinKoreMoneyError(error: unknown): error is FinKoreMoneyError {
  return error instanceof FinKoreMoneyError
}
