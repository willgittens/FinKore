// SPDX-License-Identifier: MPL-2.0
import type { ExecutionResult, ExecutionStatus } from './execution-result.js'
import type { ManifestSuite } from '../manifest.js'

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

export interface ReportManifest {
  readonly path: string
  readonly finkoreConformance: '0.1'
  readonly vectorSchema: string
  readonly suites: readonly ManifestSuite[]
}

export interface ReportFilters {
  readonly suites: readonly string[]
  readonly tags: readonly string[]
  readonly vectorIds: readonly string[]
}

export interface ReportReproducibility {
  readonly manifest: ReportManifest
  readonly filters: ReportFilters
}

export interface ConformanceReport {
  readonly finkoreCore: '0.8'
  readonly finkoreConformanceRunner: '0.1'
  readonly reproducibility: ReportReproducibility
  readonly summary: StatusCounts
  readonly mutationSensitive: StatusCounts
  readonly suites: readonly SuiteResult[]
  readonly requirements: readonly RequirementResult[]
  readonly criticalFailures: readonly CriticalFailure[]
  readonly results: readonly ExecutionResult[]
}
