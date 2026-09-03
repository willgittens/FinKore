import { FinFlowMoneyError } from '@finflow/typescript'
import type { NormalizedResult } from '@finflow/conformance-runner'

/**
 * Converts TypeScript Money domain errors into the Conformance Runner's
 * normalized error envelope.
 *
 * This function is an adapter boundary: it preserves the portable FinFlow error
 * code and deliberately omits TypeScript-specific class names and messages from
 * the normalized result.
 *
 * @param error - Unknown thrown value from the TypeScript implementation.
 * @returns A normalized conformance error when the value is a FinFlow Money
 * domain error.
 * @throws The original value when it is not a FinFlow Money domain error.
 *
 * @see SPEC-ERROR-001
 * @see SPEC-ERROR-002
 */
export function normalizeThrown(error: unknown): NormalizedResult {
  if (error instanceof FinFlowMoneyError) {
    return { status: 'error', error: { code: error.code } }
  }
  throw error
}
