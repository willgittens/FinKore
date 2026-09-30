// SPDX-License-Identifier: MPL-2.0
import { InvalidMoneyAmountError } from './errors.js'
import type { SerializedMoney } from './types.js'

/**
 * Validates a FinKore serialized Money amount without converting through
 * JavaScript `number`.
 *
 * Keeping validation in string space preserves exact base-10 semantics and
 * rejects host-language floating-point inputs, exponential notation,
 * non-finite tokens, and leading plus signs.
 *
 * @param value - Candidate amount in FinKore's portable decimal encoding.
 * @returns The validated decimal amount string.
 * @throws {InvalidMoneyAmountError}
 * When the value is missing, malformed, non-finite, or unsupported.
 *
 * @see FINKORE_MONEY_INVALID_AMOUNT
 * @see MONEY-REPRESENTATION-002
 * @see MONEY-SERIALIZATION-002
 * @see MONEY-SERIALIZATION-003
 * @see MONEY-SERIALIZATION-005
 */
export function validateSerializedAmount(value: unknown): string {
  const PLAIN_DECIMAL = /^-?\d+(?:\.\d+)?$/u
  if (typeof value !== 'string' || !PLAIN_DECIMAL.test(value)) {
    throw new InvalidMoneyAmountError()
  }
  return value
}

/**
 * Produces the canonical portable Money serialization from validated
 * components.
 *
 * This helper assumes callers have already validated amount and currency. It
 * does not localize decimal separators, add grouping, or convert to JSON
 * numbers.
 *
 * @param amount - Validated exact decimal monetary amount.
 * @param currency - Validated currency identifier associated with the amount.
 * @returns A locale-independent FinKore Money serialization.
 *
 * @see MONEY-SERIALIZATION-001
 * @see MONEY-SERIALIZATION-002
 * @see MONEY-SERIALIZATION-004
 */
export function serializeMoney(amount: string, currency: string): SerializedMoney {
  return { amount, currency }
}
