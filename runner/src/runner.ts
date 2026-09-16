// SPDX-License-Identifier: MPL-2.0
import type { FinKoreConformanceAdapter } from './adapter/types.js'
import { compareResults } from './comparator.js'
import { filterVectors, type RunFilters } from './filters.js'
import { loadConformance } from './loader.js'
import type { RunnerMetadata } from './metadata.js'
import { resolveProfile, type ProfileCatalog } from './profile.js'
import { buildReport } from './reporter.js'
import type { ExecutionResult } from './types/execution-result.js'
import type { ConformanceReport } from './types/report.js'
import type { LoadedVector } from './types/vector.js'
import { isNormalizedResult } from './validator.js'

export interface ConformanceRunnerOptions {
  readonly manifestPath: string
  readonly adapter: FinKoreConformanceAdapter
  readonly metadata?: RunnerMetadata
  readonly profiles?: ProfileCatalog
}

export interface RunOptions extends RunFilters {
  readonly profileId?: string
}

export interface ConformanceRunner {
  run(filters?: RunOptions): Promise<ConformanceReport>
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function baseResult(vector: LoadedVector, criticalRequirements: ReadonlySet<string>) {
  return {
    vectorId: vector.id,
    suiteId: vector.suiteId,
    operationId: vector.operation,
    requirementIds: vector.requirements,
    tags: vector.tags,
    critical: vector.requirements.some((id) => criticalRequirements.has(id)),
    expected: vector.expected,
  }
}

async function executeVector(
  vector: LoadedVector,
  adapter: FinKoreConformanceAdapter,
  criticalRequirements: ReadonlySet<string>,
): Promise<ExecutionResult> {
  const base = baseResult(vector, criticalRequirements)
  let supported: boolean
  try {
    supported = adapter.supports(vector.operation)
  } catch (error) {
    return { ...base, status: 'INFRASTRUCTURE_ERROR', diagnostic: `Adapter supports() failed: ${errorMessage(error)}` }
  }
  if (!supported) return { ...base, status: 'UNSUPPORTED', diagnostic: `Adapter does not support ${vector.operation}` }

  try {
    await adapter.reset?.()
    const request = vector.context === undefined
      ? { operationId: vector.operation, input: vector.input }
      : { operationId: vector.operation, input: vector.input, context: vector.context }
    const actual: unknown = await adapter.execute(request)
    if (!isNormalizedResult(actual)) {
      return { ...base, status: 'INFRASTRUCTURE_ERROR', diagnostic: 'Adapter returned an invalid normalized result' }
    }
    const comparison = compareResults(vector.expected, actual)
    return comparison.matches
      ? { ...base, status: 'PASS', actual }
      : { ...base, status: 'FAIL', actual, diagnostic: comparison.diagnostic }
  } catch (error) {
    return { ...base, status: 'INFRASTRUCTURE_ERROR', diagnostic: `Adapter execution failed: ${errorMessage(error)}` }
  }
}

export function createConformanceRunner(options: ConformanceRunnerOptions): ConformanceRunner {
  return {
    async run(filters: RunOptions = {}): Promise<ConformanceReport> {
      const loaded = await loadConformance(options.manifestPath, options.metadata)
      if (filters.profileId !== undefined && ((filters.suites?.length ?? 0) > 0 || (filters.tags?.length ?? 0) > 0 || (filters.vectorIds?.length ?? 0) > 0)) {
        throw new Error('Profile runs cannot be combined with suite, tag, or vector filters')
      }
      if (filters.profileId !== undefined && options.profiles === undefined) {
        throw new Error('Profile run requested without profile metadata')
      }
      const profile = filters.profileId === undefined
        ? undefined
        : (() => {
          const profiles = options.profiles
          if (profiles === undefined) throw new Error('Profile run requested without profile metadata')
          return resolveProfile(profiles, filters.profileId, loaded.manifest, loaded.vectors)
        })()
      const profileFiltered = profile === undefined
        ? loaded.vectors
        : loaded.vectors.filter((vector) => profile.vectorIds.includes(vector.id))
      const vectors = filterVectors(profileFiltered, filters)
      const results: ExecutionResult[] = []
      for (const vector of vectors) {
        results.push(await executeVector(vector, options.adapter, loaded.metadata.criticalRequirementIds))
      }
      const profileEvidence = profile === undefined
        ? undefined
        : {
          profileId: profile.profile.id,
          coreVersion: profile.profile.coreVersion,
          profileKind: profile.profile.kind,
          manifestFormat: loaded.manifest.finkoreConformance,
          vectorFileFormat: '0.1',
          vectorCount: profile.vectorIds.length,
          vectorIds: profile.vectorIds,
          sourceFiles: [...new Set(vectors.map((vector) => vector.sourceFile))].sort((left, right) => left.localeCompare(right, 'en')),
          ...(profile.profile.capabilityFloor === undefined ? {} : { capabilityFloor: profile.profile.capabilityFloor }),
        }
      return buildReport(results, loaded.metadata.criticalRequirementIds, profileEvidence)
    },
  }
}
