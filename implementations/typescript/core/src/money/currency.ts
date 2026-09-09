// SPDX-License-Identifier: MPL-2.0
import { InvalidCurrencyError } from './errors.js'

const ISO_4217_ALPHABETIC_CODE = /^[A-Z]{3}$/u

/**
 * TypeScript representation of a FinKore Money currency identifier.
 *
 * This abstraction preserves and validates the identifier used with a Money
 * amount. It does not provide exchange rates, conversion, symbols, minor-unit
 * metadata, or a complete ISO currency catalog.
 *
 * @see MONEY-CURRENCY-001
 * @see MONEY-CURRENCY-002
 * @see SPEC-CURRENCY-002
 */
export class Currency {
  /**
   * Uppercase ISO 4217 alphabetic currency identifier for this milestone's
   * normative FinKore scope.
   */
  readonly code: string

  private constructor(code: string) {
    this.code = code
  }

  /**
   * Creates a Currency from a candidate identifier.
   *
   * @param value - Candidate currency identifier to validate without
   * normalization.
   * @returns A Currency preserving the supplied identifier.
   * @throws {InvalidCurrencyError}
   * When the identifier is missing or invalid for the current FinKore Money
   * scope.
   *
   * @see FINKORE_MONEY_INVALID_CURRENCY
   * @see MONEY-ERROR-002
   * @see SPEC-CURRENCY-002
   */
  static of(value: unknown): Currency {
    if (typeof value !== 'string' || !ISO_4217_ALPHABETIC_CODE.test(value)) {
      throw new InvalidCurrencyError()
    }
    return new Currency(value)
  }

  /**
   * Returns the currency identifier exactly as preserved by this value.
   *
   * @returns The uppercase currency identifier.
   */
  toString(): string {
    return this.code
  }

  /**
   * Returns the portable JSON currency representation.
   *
   * @returns The currency identifier used by canonical Money serialization.
   *
   * @see MONEY-SERIALIZATION-004
   */
  toJSON(): string {
    return this.code
  }
}

/**
 * Checks whether a value is valid for this milestone's Currency abstraction.
 *
 * This predicate performs validation only; it does not normalize lowercase or
 * otherwise ambiguous identifiers.
 *
 * @param value - Candidate currency identifier.
 * @returns `true` when the value is an uppercase ISO 4217 alphabetic code.
 *
 * @see MONEY-CURRENCY-001
 * @see SPEC-CURRENCY-002
 */
export function isValidCurrencyIdentifier(value: unknown): value is string {
  return typeof value === 'string' && ISO_4217_ALPHABETIC_CODE.test(value)
}
