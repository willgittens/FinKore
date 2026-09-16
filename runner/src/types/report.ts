// SPDX-License-Identifier: MPL-2.0
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

export interface ProfileEvidence {
  readonly profileId: string
  readonly coreVersion: string
  readonly profileKind: string
  readonly manifestFormat: string
  readonly vectorFileFormat: string
  readonly vectorCount: number
  readonly vectorIds: readonly string[]
  readonly sourceFiles: readonly string[]
  readonly capabilityFloor?: string
}

export interface ConformanceReport {
  readonly finkoreConformanceRunner: '0.1'
  readonly profile?: ProfileEvidence
  readonly summary: StatusCounts
  readonly mutationSensitive: StatusCounts
  readonly suites: readonly SuiteResult[]
  readonly requirements: readonly RequirementResult[]
  readonly criticalFailures: readonly CriticalFailure[]
  readonly results: readonly ExecutionResult[]
}
