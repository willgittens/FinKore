import { RunnerInfrastructureError } from './errors/runner-errors.js'

export interface ManifestSuite {
  readonly id: string
  readonly vectorFiles: readonly string[]
}

export interface ConformanceManifest {
  readonly finflowConformance: '0.1'
  readonly vectorSchema: string
  readonly suites: readonly ManifestSuite[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validateManifest(value: unknown, source = 'manifest'): ConformanceManifest {
  if (!isRecord(value)) throw new RunnerInfrastructureError('MANIFEST', 'Manifest must be an object', source)
  if (value.finflowConformance !== '0.1') {
    throw new RunnerInfrastructureError('MANIFEST', 'Unsupported or missing finflowConformance version', source)
  }
  if (typeof value.vectorSchema !== 'string' || value.vectorSchema.length === 0) {
    throw new RunnerInfrastructureError('MANIFEST', 'Manifest vectorSchema must be a non-empty path', source)
  }
  if (!Array.isArray(value.suites) || value.suites.length === 0) {
    throw new RunnerInfrastructureError('MANIFEST', 'Manifest suites must be a non-empty array', source)
  }

  const seen = new Set<string>()
  const suites: ManifestSuite[] = value.suites.map((candidate, index) => {
    if (!isRecord(candidate)) {
      throw new RunnerInfrastructureError('MANIFEST', `Suite at index ${index} must be an object`, source)
    }
    const { id, vectorFiles } = candidate
    if (typeof id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(id)) {
      throw new RunnerInfrastructureError('MANIFEST', `Suite at index ${index} has an invalid id`, source)
    }
    if (seen.has(id)) throw new RunnerInfrastructureError('MANIFEST', `Duplicate suite id: ${id}`, source)
    seen.add(id)
    if (!Array.isArray(vectorFiles) || vectorFiles.length === 0 || vectorFiles.some((file) => typeof file !== 'string' || file.length === 0)) {
      throw new RunnerInfrastructureError('MANIFEST', `Suite ${id} must declare non-empty vectorFiles`, source)
    }
    if (new Set(vectorFiles).size !== vectorFiles.length) {
      throw new RunnerInfrastructureError('MANIFEST', `Suite ${id} declares duplicate vector files`, source)
    }
    return { id, vectorFiles: vectorFiles as string[] }
  })

  return { finflowConformance: '0.1', vectorSchema: value.vectorSchema, suites }
}
