import { Money } from '@finflow/typescript'
import type { AdapterRequest, NormalizedResult } from '@finflow/conformance-runner'
import { normalizeThrown } from './normalization.js'

/**
 * Conformance operation handler for one supported operation ID.
 *
 * Handlers translate conformance input fixtures into TypeScript API calls and
 * return normalized observations for the runner.
 */
type OperationHandler = (request: AdapterRequest) => NormalizedResult

function inputValue(input: unknown): unknown {
  if (typeof input !== 'object' || input === null || !('value' in input)) {
    return undefined
  }
  return (input as { readonly value: unknown }).value
}

/**
 * Executes the first-milestone Money serialization boundary.
 *
 * The conformance operations `money.deserialize` and `money.serialize` both
 * observe construction followed by canonical portable serialization in this
 * milestone. Financial validation remains in the core TypeScript Money API; the
 * adapter only translates inputs, outputs, and portable errors.
 */
function executeMoneySerialization(request: AdapterRequest): NormalizedResult {
  try {
    return { status: 'success', value: Money.deserialize(inputValue(request.input)).toJSON() }
  } catch (error) {
    return normalizeThrown(error)
  }
}

/**
 * Operation handlers supported by the first TypeScript conformance adapter.
 *
 * These are conformance-local operation identifiers from the vector catalog,
 * not new Agentic Contract operation IDs. Future `finflow.money.*` support must
 * be added only when the corresponding TypeScript domain behavior exists.
 *
 * @see MONEY-SERIALIZATION-001
 */
export const operationHandlers = {
  'money.deserialize': executeMoneySerialization,
  'money.serialize': executeMoneySerialization,
} satisfies Readonly<Record<string, OperationHandler>>

/**
 * Operation IDs currently supported by the TypeScript conformance adapter.
 */
export type SupportedOperationId = keyof typeof operationHandlers
