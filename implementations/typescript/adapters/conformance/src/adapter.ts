// SPDX-License-Identifier: MPL-2.0
import type { AdapterRequest, FinKoreConformanceAdapter, NormalizedResult } from '@finkore/conformance-runner'
import { operationHandlers } from './operations.js'

/**
 * Creates the TypeScript implementation adapter for the FinKore Conformance
 * Runner.
 *
 * The adapter maps conformance operation identifiers to the TypeScript
 * reference implementation and normalizes observable results for comparison.
 * It must not implement financial domain rules itself; those belong in
 * `@finkore/typescript`, with `/spec` remaining authoritative.
 *
 * @returns A conformance adapter supporting the operations implemented by the
 * current TypeScript FinKore Core 0.9 release candidate behavior.
 */
export function createTypeScriptConformanceAdapter(): FinKoreConformanceAdapter {
  return {
    /**
     * Reports whether this adapter supports a conformance operation.
     *
     * @param operationId - Operation identifier from the conformance vector
     * catalog.
     * @returns `true` only for operations wired to implemented TypeScript
     * behavior.
     */
    supports(operationId: string): boolean {
      return operationId in operationHandlers
    },

    /**
     * Executes one supported conformance operation.
     *
     * @param request - Runner request containing the operation ID and vector
     * input fixture.
     * @returns The normalized success or portable error result expected by the
     * Conformance Runner.
     */
    execute(request: AdapterRequest): NormalizedResult {
      const handler = operationHandlers[request.operationId as keyof typeof operationHandlers]
      if (handler === undefined) {
        throw new Error(`Unsupported TypeScript conformance operation: ${request.operationId}`)
      }
      return handler(request)
    },
  }
}

/**
 * Short alias for {@link createTypeScriptConformanceAdapter}.
 */
export { createTypeScriptConformanceAdapter as createAdapter }

/**
 * Default concrete adapter consumed by the Conformance Runner CLI.
 */
export const adapter = createTypeScriptConformanceAdapter()
