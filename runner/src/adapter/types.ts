// SPDX-License-Identifier: MPL-2.0
import type { NormalizedResult } from '../types/normalized-result.js'

export interface AdapterRequest {
  readonly operationId: string
  readonly input: unknown
  readonly context?: unknown
}

export interface FinKoreConformanceAdapter {
  supports(operationId: string): boolean
  execute(request: AdapterRequest): Promise<NormalizedResult> | NormalizedResult
  reset?(): Promise<void> | void
}
