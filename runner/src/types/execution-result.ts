import type { NormalizedResult } from './normalized-result.js'
import type { ExpectedResult } from './vector.js'

export type ExecutionStatus = 'PASS' | 'FAIL' | 'UNSUPPORTED' | 'INFRASTRUCTURE_ERROR'

export interface ExecutionResult {
  readonly vectorId: string
  readonly suiteId: string
  readonly operationId: string
  readonly requirementIds: readonly string[]
  readonly tags: readonly string[]
  readonly critical: boolean
  readonly status: ExecutionStatus
  readonly expected: ExpectedResult
  readonly actual?: NormalizedResult
  readonly diagnostic?: string
}
