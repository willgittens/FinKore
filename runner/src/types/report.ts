import type { ExecutionResult, ExecutionStatus } from './execution-result.js'

export interface StatusCounts {
  readonly total: number
  readonly passed: number
  readonly failed: number
  readonly unsupported: number
  readonly infrastructureErrors: number
}

export interface RequirementResult {
  readonly requirementId: string
  readonly critical: boolean
  readonly counts: StatusCounts
}

export interface SuiteResult {
  readonly suiteId: string
  readonly counts: StatusCounts
}

export interface CriticalFailure {
  readonly requirementId: string
  readonly vectorId: string
  readonly status: Exclude<ExecutionStatus, 'PASS'>
}

export interface ConformanceReport {
  readonly finflowConformanceRunner: '0.1'
  readonly summary: StatusCounts
  readonly mutationSensitive: StatusCounts
  readonly suites: readonly SuiteResult[]
  readonly requirements: readonly RequirementResult[]
  readonly criticalFailures: readonly CriticalFailure[]
  readonly results: readonly ExecutionResult[]
}
