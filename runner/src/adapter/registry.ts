import type { AdapterRequest, FinFlowConformanceAdapter } from './types.js'
import type { NormalizedResult } from '../types/normalized-result.js'

export type AdapterHandler = (request: AdapterRequest) => Promise<NormalizedResult> | NormalizedResult

export function createAdapterRegistry(
  handlers: Readonly<Record<string, AdapterHandler>>,
): FinFlowConformanceAdapter {
  return {
    supports: (operationId) => Object.hasOwn(handlers, operationId),
    execute: (request) => {
      const handler = handlers[request.operationId]
      if (handler === undefined) {
        throw new Error(`No adapter handler registered for ${request.operationId}`)
      }
      return handler(request)
    },
  }
}
